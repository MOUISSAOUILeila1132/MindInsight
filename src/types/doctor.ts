
export interface DoctorCreate {
  nom: string;
  prenom?: string;
  email: string;
  password: string;
  specialite: string;
}

export interface DoctorResponse {
  doctorId: string;
  nom: string;
  prenom?: string;
  email: string;
  specialite: string;
  message: string;
}

export interface DoctorLogin {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  doctorId: string;
  nom: string;
  email: string;
  access_token: string; // Added this field to match the API response
  message: string;
}
