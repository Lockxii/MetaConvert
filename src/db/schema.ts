import { pgTable, serial, text, timestamp, integer, boolean, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Buffer) {
    return value;
  },
  fromDriver(value: unknown) {
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Uint8Array) return Buffer.from(value);
    if (typeof value === 'string') {
      if (value.startsWith('\\x')) {
        return Buffer.from(value.slice(2), 'hex');
      }
      // Si c'est du hex pur
      if (/^[0-9a-fA-F]+$/.test(value)) {
        return Buffer.from(value, 'hex');
      }
    }
    if (value && typeof value === 'object') {
      const obj = value as any;
      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return Buffer.from(obj.data);
      }
      if (Array.isArray(obj.data)) {
        return Buffer.from(obj.data);
      }
    }
    return Buffer.from(value as any);
  },
});

export const fileStorage = pgTable('file_storage', {
    id: text('id').primaryKey(),
    content: bytea('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- Application Specific Tables ---

export const conversions = pgTable('conversions', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  targetType: text('target_type').notNull(),
  status: text('status').notNull(),
  filePath: text('file_path'), // Added for Cloud storage
  createdAt: timestamp('created_at').defaultNow(),
  originalSize: integer('original_size'),
  convertedSize: integer('converted_size'),
  userId: text('user_id').references(() => user.id),
  dropLinkId: text('drop_link_id').references(() => dropLinks.id)
});

export const upscales = pgTable('upscales', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  originalSize: integer('original_size'),
  upscaledSize: integer('upscaled_size'),
  factor: integer('factor').default(2),
  filePath: text('file_path'), // Added for Cloud storage
  createdAt: timestamp('created_at').defaultNow(),
  userId: text('user_id').references(() => user.id),
  dropLinkId: text('drop_link_id').references(() => dropLinks.id)
});

// --- Better Auth Tables ---

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(()=> user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(()=> user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	expiresAt: timestamp("expiresAt"),
	password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull()
});

export const userSettings = pgTable("user_settings", {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: 'cascade' }),
    theme: text("theme").default("system").notNull(), // "light", "dark", "system"
    defaultOutputFormat: text("default_output_format").default("png"),
    receiveEmailNotifications: boolean("receive_email_notifications").default(true),
    // Add other settings here as needed
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const sharedLinks = pgTable('shared_links', {
  id: text('id').primaryKey(), // UUID unique pour le lien
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(), // Chemin local ou URL
  password: text('password'), // Optionnel
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  downloadCount: integer('download_count').default(0),
  userId: text('user_id').references(() => user.id)
});

export const dropLinks = pgTable('drop_links', {
  id: text('id').primaryKey(), // UUID
  title: text('title').notNull(),
  description: text('description'),
  password: text('password'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  userId: text('user_id').notNull().references(() => user.id),
  isActive: boolean('active').default(true)
});