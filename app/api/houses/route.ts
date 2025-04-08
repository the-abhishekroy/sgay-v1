import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'beneficiaries.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const houses = JSON.parse(fileData);
    
    // Return the data as JSON
    return NextResponse.json(houses);
  } catch (error) {
    console.error('Error reading beneficiaries file:', error);
    return NextResponse.json(
      { error: 'Failed to load beneficiary data' },
      { status: 500 }
    );
  }
}