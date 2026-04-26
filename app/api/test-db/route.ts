import clientPromise from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // Test connection by pinging the database
    await db.admin().ping()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      database: db.databaseName 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
