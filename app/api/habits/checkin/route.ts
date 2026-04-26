import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Habit, HabitCheckIn } from '@/models/Habit'
import connectDB from '@/lib/mongoose'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const habitId = searchParams.get('habitId')

    await connectDB()

    const userHabits = await Habit.find({ userId: session.user.id, isActive: true }).select('_id')
    const userHabitIds = userHabits.map(habit => habit._id)

    let query: any = {
      habitId: { $in: userHabitIds }
    }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      }
    } else if (startDate || endDate) {
      query.date = {}

      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        query.date.$gte = start
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        query.date.$lte = end
      }
    }
    
    if (habitId) {
      query.habitId = { $in: userHabitIds.filter(id => id.toString() === habitId) }
    }

    const checkIns = await HabitCheckIn.find(query)
      .populate('habitId')
      .sort({ date: -1 })

    return NextResponse.json(checkIns)
  } catch (error) {
    console.error('Error fetching check-ins:', error)
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { habitId, date, completed, count, notes } = body

    await connectDB()

    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id, isActive: true })
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }
    
    const checkIn = await HabitCheckIn.findOneAndUpdate(
      {
        habitId,
        date: new Date(date).setHours(0, 0, 0, 0)
      },
      {
        completed,
        count: count || 0,
        notes: notes || '',
      },
      { upsert: true, new: true }
    ).populate('habitId')

    return NextResponse.json(checkIn, { status: 201 })
  } catch (error) {
    console.error('Error creating check-in:', error)
    return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 })
  }
}
