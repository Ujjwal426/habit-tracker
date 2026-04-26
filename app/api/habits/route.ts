import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Habit } from '@/models/Habit'
import connectDB from '@/lib/mongoose'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const habits = await Habit.find({ 
      userId: session.user.id, 
      isActive: true 
    }).sort({ createdAt: -1 })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, frequency, customDays, target, color } = body

    await connectDB()
    const habit = await Habit.create({
      userId: session.user.id,
      name,
      description,
      category,
      frequency,
      customDays: customDays || [],
      target: target || 1,
      color: color || '#6366f1',
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}
