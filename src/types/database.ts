export type VehicleType = "bike" | "car";
export type VehicleStatus = "available" | "booked" | "maintenance";
export type BookingStatus = "pending" | "confirmed" | "ready" | "picked_up" | "returned" | "completed" | "cancelled";
export type FulfillmentMethod = "doorstep_delivery" | "location_pickup";
export type OwnerType = "platform" | "individual";

// NOTE: these row types must be `type` aliases, not `interface`s — only type
// aliases get TypeScript's implicit index signature, which Supabase's
// GenericTable constraint (Row/Insert/Update extends Record<string, unknown>)
// relies on. Interfaces here silently make every query resolve to `never`.
export type Town = {
  id: string;
  name: string;
  slug: string;
  state: string;
  active: boolean;
  pickup_address: string | null;
  maps_url: string | null;
  delivery_fee: number;
  collection_fee: number;
  delivery_radius_km: number;
  opening_time: string;
  closing_time: string;
};

export type Owner = {
  id: string;
  name: string;
  phone: string;
  type: OwnerType;
  verified: boolean;
};

// A discount tier for longer rentals: price_per_day applies once a booking
// runs `min_days` or more (e.g. { min_days: 5, price_per_day: 349 } means
// day 5 onward costs 349/day instead of the base rate). Tiers beyond the
// base rate only — the base rate itself stays in `Vehicle.price_per_day`.
export type PriceTier = {
  min_days: number;
  price_per_day: number;
};

export type Vehicle = {
  id: string;
  owner_id: string;
  town_id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  registration_no: string;
  price_per_day: number;
  price_tiers: PriceTier[];
  photos: string[];
  status: VehicleStatus;
  created_at: string;
  fuel_type: "petrol" | "diesel" | "electric" | "cng" | null;
  transmission: "manual" | "automatic" | "gearless" | null;
  seats: number | null;
  included_km_per_day: number | null;
  extra_km_rate: number | null;
  helmet_count: number;
  last_inspected_at: string | null;
  luggage_capacity: string | null;
};

export type Booking = {
  id: string;
  vehicle_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  estimated_total: number | null;
  status: BookingStatus;
  created_at: string;
  privacy_accepted_at: string | null;
  fulfillment_method: FulfillmentMethod;
  reference: string;
  pickup_time: string | null;
  return_time: string | null;
  delivery_address: string | null;
  return_method: "location_return" | "doorstep_collection";
  delivery_fee: number;
  collection_fee: number;
  extras_total: number;
  deposit_amount: number;
  payment_status: "unpaid" | "part_paid" | "paid" | "refunded";
  deposit_status: "not_collected" | "held" | "partially_refunded" | "refunded" | "forfeited";
  customer_notes: string | null;
};

export type BookingInspection = {
  id: string;
  booking_id: string;
  stage: "handover" | "return";
  odometer_km: number | null;
  fuel_level: "empty" | "quarter" | "half" | "three_quarters" | "full" | "electric" | null;
  notes: string | null;
  photo_paths: string[];
  created_by: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  is_admin: boolean;
};

type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      towns: {
        Row: Town;
        Insert: Partial<Town> & Pick<Town, "name" | "slug">;
        Update: Partial<Town>;
        Relationships: GenericRelationship[];
      };
      owners: {
        Row: Owner;
        Insert: Partial<Owner> & Pick<Owner, "name" | "phone" | "type">;
        Update: Partial<Owner>;
        Relationships: GenericRelationship[];
      };
      vehicles: {
        Row: Vehicle;
        Insert: Partial<Vehicle> &
          Pick<
            Vehicle,
            | "owner_id"
            | "town_id"
            | "type"
            | "make"
            | "model"
            | "year"
            | "registration_no"
            | "price_per_day"
          >;
        Update: Partial<Vehicle>;
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicles_town_id_fkey";
            columns: ["town_id"];
            isOneToOne: false;
            referencedRelation: "towns";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking> &
          Pick<
            Booking,
            "vehicle_id" | "customer_name" | "customer_phone" | "start_date" | "end_date"
          >;
        Update: Partial<Booking>;
        Relationships: [
          {
            foreignKeyName: "bookings_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
        Relationships: GenericRelationship[];
      };
      booking_inspections: {
        Row: BookingInspection;
        Insert: Partial<BookingInspection> & Pick<BookingInspection, "booking_id" | "stage">;
        Update: Partial<BookingInspection>;
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      vehicle_has_overlap: {
        Args: { p_vehicle_id: string; p_start: string; p_end: string };
        Returns: boolean;
      };
      vehicle_booked_ranges: {
        Args: { p_vehicle_id: string };
        Returns: { start_date: string; end_date: string }[];
      };
      create_booking_request: {
        Args: {
          p_vehicle_id: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_start: string;
          p_end: string;
          p_accept_policy: boolean;
        };
        Returns: string;
      };
      create_booking_request_v2: {
        Args: {
          p_vehicle_id: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_start: string;
          p_end: string;
          p_accept_policy: boolean;
          p_fulfillment_method: FulfillmentMethod;
        };
        Returns: string;
      };
      create_booking_request_v3: {
        Args: {
          p_vehicle_id: string; p_customer_name: string; p_customer_phone: string;
          p_start: string; p_end: string; p_accept_policy: boolean;
          p_fulfillment_method: FulfillmentMethod; p_pickup_time: string; p_return_time: string;
          p_delivery_address: string; p_return_method: "location_return" | "doorstep_collection";
          p_customer_notes: string;
        };
        Returns: string;
      };
      customer_cancel_booking: { Args: { p_booking_id: string }; Returns: boolean };
      customer_reschedule_booking: { Args: { p_booking_id: string; p_start: string; p_end: string }; Returns: boolean };
    };
  };
};
