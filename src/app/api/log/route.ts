// app/api/log/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface HealthData {
  Date: string;
  Time: string;
  Food_Item: string;
  Quantity: string;
  Calories: string;
  Meal_Time: string;
  BP_Systolic: string;
  BP_Diastolic: string;
  Sugar_Level: string;
  Weight: string;
  Waist_Circumference: string;
  Notes: string;
}

// In-memory storage (you can replace this with a database later)
let healthLogs: (HealthData & { id: string; timestamp: string })[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: HealthData = await request.json();
    
    // Validate required fields
    if (!body.Date || !body.Time) {
      return NextResponse.json(
        { error: 'Date and Time are required fields' },
        { status: 400 }
      );
    }

    // Create a new log entry
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...body
    };

    // Store the log (in memory for now)
    healthLogs.push(newLog);

    console.log('New health log received:', newLog);

    return NextResponse.json({
      success: true,
      message: 'Health data logged successfully!',
      data: newLog,
      totalLogs: healthLogs.length
    });

  } catch (error) {
    console.error('Error processing health log:', error);
    return NextResponse.json(
      { error: 'Failed to process health data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return all logs (you might want to add pagination later)
    return NextResponse.json({
      success: true,
      logs: healthLogs,
      totalLogs: healthLogs.length
    });
  } catch (error) {
    console.error('Error fetching health logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health data' },
      { status: 500 }
    );
  }
}