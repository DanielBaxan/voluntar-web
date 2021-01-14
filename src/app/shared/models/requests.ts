import { Beneficiary } from './beneficiary';
import { IVolunteer } from './volunteers';

export type RequestStatus =
  | 'new'
  | 'confirmed'
  | 'in_process'
  | 'canceled'
  | 'solved'
  | 'archived';
export type RequestType = 'warm_lunch' | 'grocery' | 'medicine';
export type NewRequestType =
  | 'warm_lunch'
  | 'grocery'
  | 'medicine'
  | 'invoices'
  | 'transport';

export interface IRequest {
  _id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: number;
  is_active: true;
  address: string;
  zone_address: string;
  //Beneficiary - city zones like centru, botanica .. etc...
  zone: string;
  age: number;
  latitude: number;
  longitude: number;
  activity_types: string;
  have_money: true;
  comments: string;
  fixer_comment: string;
  questions: string;
  status: RequestStatus;
  secret: string;
  availability_volunteer: number;
  volunteer: string;

  is_urgent: boolean;
  offer: string;
  city: string;
  has_symptoms: boolean;
  curator: boolean;
  has_disabilities: boolean;
  additional_info: string[];
  fixer: string;

  paying_by_card: boolean;
  type: RequestType;
  warm_lunch: boolean;
  grocery: boolean;
  medicine: boolean;
  in_blacklist: boolean;
}

export interface IRequestDetails extends IRequest {
  created_at: string;
}

export interface IRequestNew {
  _id?: string;
  beneficiary: Beneficiary;
  user: string;
  type: NewRequestType;
  status: RequestStatus;
  number: number;
  secret: string;
  urgent: boolean;
  comments: string;
  has_symptoms: boolean;
  created_at: string;
  volunteer: IVolunteer;
}

// export interface IComment { }
