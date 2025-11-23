import { mockCustomer, mockEvents, mockMoodWave, mockModulesData, mockAlerts, mockActionItems } from "@/data/customer360Mocks";
import { Customer, Event, MoodWavePoint, ModuleData, Alert, ActionItem } from "@/types";

// Simulate API call delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCustomer = async (customerId: string): Promise<Customer> => {
  await simulateDelay(500); // Simulate network delay
  if (customerId === mockCustomer.id) {
    return mockCustomer;
  }
  throw new Error("Customer not found");
};

export const fetchCustomerEvents = async (customerId: string, startDate?: string, endDate?: string): Promise<{ events: Event[]; moodWave: MoodWavePoint[] }> => {
  await simulateDelay(700); // Simulate network delay
  if (customerId === mockCustomer.id) {
    let filteredEvents = mockEvents;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }
    return { events: filteredEvents, moodWave: mockMoodWave };
  }
  throw new Error("Events not found for customer");
};

export const fetchModulesData = async (customerId: string): Promise<ModuleData[]> => {
  await simulateDelay(300);
  if (customerId === mockCustomer.id) {
    return mockModulesData;
  }
  throw new Error("Module data not found");
};

export const fetchProactiveAlerts = async (customerId: string): Promise<Alert[]> => {
  await simulateDelay(400);
  if (customerId === mockCustomer.id) {
    return mockAlerts;
  }
  throw new Error("Alerts not found");
};

export const fetchActionItems = async (customerId: string): Promise<ActionItem[]> => {
  await simulateDelay(200);
  // In a real app, actions might be dynamic based on customer context
  return mockActionItems;
};

// Mock API endpoints for developer output
export const mockApiEndpoints = {
  getCustomer: (id: string) => `/api/customer/${id}`,
  getCustomerEvents: (id: string) => `/api/customer/${id}/events`,
  postAlert: (id: string) => `/api/alerts`, // Example POST endpoint
};

// Example responses for developer output
export const mockApiResponseCustomer = mockCustomer;
export const mockApiResponseEvents = { events: mockEvents, moodWave: mockMoodWave };
export const mockApiResponsePostAlert = { status: "success", message: "Alert created successfully." };