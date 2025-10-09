import connectDB from '@/lib/mongodb';
import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name?: string;
  description?: string;
  lat?: string;
  lon?: string;
  date?: Date;
  icao?: string;
  imageurl?: string;
  // Zusätzliche Felder für die neue Funktionalität
  title?: string;
  location?: string;
  address?: string;
  startTime?: string;
  endTime?: string;
  eventType?: 'Flugtag' | 'Luftfahrt-Event' | 'Workshop' | 'Vereinsveranstaltung' | 'Sonstiges';
  organizer?: string;
  contactEmail?: string;
  contactPhone?: string;
  maxParticipants?: number;
  registrationRequired?: boolean;
  entryFee?: number;
  website?: string;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EventSchema = new Schema<IEvent>({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name darf maximal 100 Zeichen haben']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Beschreibung darf maximal 2000 Zeichen haben']
  },
  lat: {
    type: String,
    trim: true
  },
  lon: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  icao: {
    type: String,
    trim: true
  },
  imageurl: {
    type: String,
    trim: true
  },
  // Zusätzliche Felder für erweiterte Funktionalität
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Titel darf maximal 100 Zeichen haben']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Ort darf maximal 100 Zeichen haben']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Adresse darf maximal 200 Zeichen haben']
  },
  startTime: {
    type: String,
    trim: true
  },
  endTime: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['Flugtag', 'Luftfahrt-Event', 'Workshop', 'Vereinsveranstaltung', 'Sonstiges'],
    default: 'Sonstiges'
  },
  organizer: {
    type: String,
    trim: true,
    maxlength: [100, 'Veranstalter darf maximal 100 Zeichen haben']
  },
  contactEmail: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    ]
  },
  contactPhone: {
    type: String,
    trim: true
  },
  maxParticipants: {
    type: Number,
    min: [1, 'Maximale Teilnehmerzahl muss mindestens 1 sein']
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  entryFee: {
    type: Number,
    min: [0, 'Eintrittspreis darf nicht negativ sein'],
    default: 0
  },
  website: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook um sicherzustellen, dass mindestens ein Titel oder Name vorhanden ist
EventSchema.pre('save', function(next) {
  if (!this.title && !this.name) {
    return next(new Error('Mindestens ein Titel oder Name ist erforderlich'));
  }
  next();
});

// Lösche das alte Model aus dem Cache
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const Event = mongoose.model<IEvent>('Event', EventSchema, 'events');


export default Event;
