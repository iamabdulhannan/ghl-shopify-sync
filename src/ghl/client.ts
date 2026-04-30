import axios, { AxiosInstance } from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';

export interface UpsertContactInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customField?: Record<string, unknown>;
  source?: string;
  locationId?: string;
}

export interface GhlContact {
  id: string;
  email?: string;
  phone?: string;
}

export interface CreateOpportunityInput {
  contactId: string;
  title: string;
  monetaryValue: number;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
}

export class GhlClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: 'https://rest.gohighlevel.com/v1',
      headers: {
        Authorization: `Bearer ${config.GHL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
  }

  async upsertContact(input: UpsertContactInput): Promise<GhlContact> {
    const body = { ...input, locationId: input.locationId ?? config.GHL_LOCATION_ID };
    const { data } = await this.http.post('/contacts/', body);
    const contact = data.contact ?? data;
    logger.debug({ contactId: contact?.id, email: input.email }, 'GHL contact upserted');
    return contact;
  }

  async addTags(contactId: string, tags: string[]): Promise<void> {
    if (!tags.length) return;
    await this.http.post(`/contacts/${contactId}/tags/`, { tags });
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<void> {
    await this.http.post('/pipelines/opportunities/', input);
    logger.debug({ contactId: input.contactId, value: input.monetaryValue }, 'GHL opportunity created');
  }
}

export const ghl = new GhlClient();
