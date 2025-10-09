import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const eventType = searchParams.get('eventType');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (eventType && eventType !== '') {
      query.eventType = eventType;
    }

    if (location && location !== '') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search && search !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { icao: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filtering
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add 1 day and subtract 1ms to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setMilliseconds(-1);
        query.date.$lte = endDate;
      }
    }

    // Time filtering (for events with startTime and endTime)
    if (timeFrom || timeTo) {
      const timeConditions = [];
      
      if (timeFrom && timeTo) {
        // Both time filters specified
        timeConditions.push({
          $and: [
            { startTime: { $gte: timeFrom } },
            { endTime: { $lte: timeTo } }
          ]
        });
        // Also include events that overlap with the time range
        timeConditions.push({
          $and: [
            { startTime: { $lte: timeTo } },
            { endTime: { $gte: timeFrom } }
          ]
        });
      } else if (timeFrom) {
        // Only start time filter
        timeConditions.push({
          $or: [
            { startTime: { $gte: timeFrom } },
            { endTime: { $gte: timeFrom } }
          ]
        });
      } else if (timeTo) {
        // Only end time filter
        timeConditions.push({
          $or: [
            { startTime: { $lte: timeTo } },
            { endTime: { $lte: timeTo } }
          ]
        });
      }

      if (timeConditions.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({ $or: timeConditions });
      }
    }

    // console.log(query);

    // add me a mongo query to get the events

    // Verwende das Mongoose Model
    const events = await Event.find(query)
      // .sort({ date: 1 })
      // .limit(limit * 1)
      // .skip((page - 1) * limit)
      // .lean();

    const total = await Event.countDocuments(query);

    return NextResponse.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // Prüfe Content-Type
    const contentType = request.headers.get('content-type') || '';
    let eventData: Record<string, unknown> = {};
    let uploadedImageUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();

      // Sammle Felder
      form.forEach((value, key) => {
        if (key === 'image') return; // Datei separat behandeln
        if (typeof value === 'string') {
          // parse booleans and numbers where applicable
          if (key === 'registrationRequired') {
            eventData[key] = value === 'true' || value === 'on';
          } else if (key === 'maxParticipants') {
            const n = parseInt(value);
            if (!Number.isNaN(n)) eventData[key] = n;
          } else if (key === 'entryFee') {
            const f = parseFloat(value);
            if (!Number.isNaN(f)) eventData[key] = f;
          } else if (key === 'tags') {
            eventData[key] = value
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t.length > 0);
          } else {
            eventData[key] = value;
          }
        }
      });

      const file = form.get('image');
      if (file && file instanceof File) {
        try {
          // Datei zu Cloudinary hochladen
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Cloudinary nur hier dynamisch importieren, damit GET nicht fehlschlägt
          const { v2: cloudinary } = await import('cloudinary');
          const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
          if (!CLOUDINARY_URL) {
            console.warn('CLOUDINARY_URL nicht gesetzt - Event wird ohne Bild erstellt');
          } else {
            cloudinary.config({ secure: true });

            const uploadResult = await Promise.race([
              new Promise<{ secure_url: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { folder: 'fliegerevents', resource_type: 'image' },
                  (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result as unknown as { secure_url: string });
                  }
                );
                stream.end(buffer);
              }),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Upload timeout')), 30000)
              )
            ]);

            uploadedImageUrl = uploadResult.secure_url;
          }
        } catch (uploadError) {
          console.error('Fehler beim Bild-Upload:', uploadError);
          // Event trotzdem erstellen, nur ohne Bild
        }
      }
    } else {
      // JSON body fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (await request.json()) as any;
      eventData = body ?? {};
    }

    // Sicherstellen, dass mindestens ein Titel oder Name vorhanden ist
    if (!eventData['title'] && !eventData['name']) {
      return NextResponse.json(
        { error: 'Titel oder Name ist erforderlich' },
        { status: 400 }
      );
    }

    await connectDB();

    const event = new Event({
      ...eventData,
      ...(uploadedImageUrl ? { imageurl: uploadedImageUrl } : {}),
      createdBy: user.userId,
    });

    await event.save();

    console.log('Event erfolgreich erstellt:', event._id);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Events:', error);
    
    // Detailliertere Fehlerbehandlung für Validierungsfehler
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json(
        { error: 'Validierungsfehler: ' + error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
