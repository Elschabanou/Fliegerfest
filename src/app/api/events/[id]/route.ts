import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log('Suche Event mit ID:', id);

    // Versuche zuerst direkt mit MongoDB Collection
    const mongoose = await import('mongoose');
    let event = null;
    
    if (mongoose.connection.db) {
      const eventsCollection = mongoose.connection.db.collection('events');
      const directEvent = await eventsCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
      console.log('Direktes Suchergebnis:', directEvent);
      
      if (directEvent) {
        event = directEvent;
      }
    }
    
    // Falls nicht gefunden, versuche mit Mongoose
    if (!event) {
      console.log('Versuche mit Mongoose...');
      event = await Event.findById(id).populate('createdBy', 'name email');
    }

    if (!event) {
      console.log('Event nicht gefunden für ID:', id);
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    console.log('Event gefunden:', event._id);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Fehler beim Abrufen des Events:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    if (event.createdBy && event.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Bearbeiten dieses Events' },
        { status: 403 }
      );
    }

    const updateData = await request.json();

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Events:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event nicht gefunden' },
        { status: 404 }
      );
    }

    if (event.createdBy && event.createdBy.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Löschen dieses Events' },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Events:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
