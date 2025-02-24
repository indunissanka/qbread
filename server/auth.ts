import { Strategy as LineStrategy } from 'passport-line-auth';
import passport from 'passport';
import { storage } from './storage';

if (!process.env.LINE_CHANNEL_ID || !process.env.LINE_CHANNEL_SECRET) {
  throw new Error('LINE_CHANNEL_ID and LINE_CHANNEL_SECRET must be set');
}

const channelId = parseInt(process.env.LINE_CHANNEL_ID);
if (isNaN(channelId)) {
  throw new Error(
    'LINE_CHANNEL_ID must be a numeric value. Please check your Line Developers Console for the correct Channel ID (not the Channel Secret or Bot User ID).'
  );
}

console.log("[Line Auth] Initializing with Channel ID:", channelId);

const callbackURL = process.env.REPL_SLUG && process.env.REPL_OWNER
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/line/callback`
  : 'http://localhost:5000/api/auth/line/callback';

console.log("[Line Auth] Using callback URL:", callbackURL);
console.log("[Line Auth] Please ensure this URL is registered in your Line Developers Console");
console.log("[Line Auth] Environment variables:", {
  REPL_SLUG: process.env.REPL_SLUG,
  REPL_OWNER: process.env.REPL_OWNER
});

// Configure Line login strategy
passport.use(new LineStrategy({
  channelID: channelId,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  callbackURL: callbackURL,
  scope: ['profile', 'openid', 'email'],
  botPrompt: 'normal'
}, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
  try {
    console.log("[Line Auth] Received profile:", { id: profile.id, displayName: profile.displayName });
    let user = await storage.getUserByLineId(profile.id);

    if (!user) {
      user = await storage.createUser({
        lineId: profile.id,
        displayName: profile.displayName,
        picture: profile.pictureUrl,
        email: profile.email,
        role: 'user' 
      });
      console.log("[Line Auth] Created new user:", { id: user.id, displayName: user.displayName });
    } else {
      console.log("[Line Auth] Found existing user:", { id: user.id, displayName: user.displayName });
    }

    return done(null, user);
  } catch (error) {
    console.error("[Line Auth] Error during authentication:", error);
    return done(error as Error);
  }
}));

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};