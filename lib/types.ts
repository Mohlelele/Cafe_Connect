// Plain shapes passed from the server to the browser. Prisma's Decimal and Date
// values cannot cross that boundary, so lib/data.ts converts them to these.

export type UserRole = 'student' | 'admin';
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Collected';
export type PaymentMethod = 'Cash' | 'Card' | 'EFT' | 'InstantEFT';
export type PaymentStatus = 'Unpaid' | 'Paid';
export type MenuCategory = 'Burgers' | 'Pizza' | 'Meals' | 'Drinks';

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isStaff: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl: string;
  category: MenuCategory;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type OrderLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  status: OrderStatus;
  createdAt: string;
  statusUpdatedAt: string;
  items: OrderLine[];
};

export type Student = Pick<Profile, 'id' | 'fullName' | 'email'>;

export type ActionResult = { ok: boolean; message: string };
