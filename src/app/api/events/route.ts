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

    // Direkt mit der MongoDB Collection arbeiten
    const eventsCollection = mongoose.connection.db?.collection('events');
    
    if (!eventsCollection) {
      throw new Error('MongoDB-Verbindung nicht verfügbar');
    }
    const events = await eventsCollection
      .find(query)
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .toArray();

    const total = await eventsCollection.countDocuments(query);

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

    const eventData = await request.json();

    // Sicherstellen, dass mindestens ein Titel oder Name vorhanden ist
    if (!eventData.title && !eventData.name) {
      return NextResponse.json(
        { error: 'Titel oder Name ist erforderlich' },
        { status: 400 }
      );
    }

    await connectDB();

    const event = new Event({
      ...eventData,
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
