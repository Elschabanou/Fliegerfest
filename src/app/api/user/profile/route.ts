import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    await connectDB();

    // Finde den User in der Datenbank (ohne das Passwort-Feld)
    console.log('Suche User mit ID:', user.userId);
    const userData = await User.findById(user.userId).select('-password');

    if (!userData) {
      console.log('User nicht gefunden für ID:', user.userId);
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    console.log('User gefunden:', {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Fehler beim Laden der User-Daten:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
