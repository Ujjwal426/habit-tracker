import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Habit } from '@/models/Habit'
import connectDB from '@/lib/mongoose'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, frequency, customDays, monthlyTarget, color, isActive } = body

    await connectDB()
    const habit = await Habit.findOneAndUpdate(
      { 
        _id: params.id, 
        userId: session.user.id 
      },
      {
        name,
        description,
        category,
        frequency,
        customDays: customDays || [],
        monthlyTarget: monthlyTarget || 1,
        color: color || '#6366f1',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
      { new: true }
    )

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const habit = await Habit.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
}
