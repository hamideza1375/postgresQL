import User from '@/models/User';
import { dbConnect } from '@/utils/dbConnect';
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  name: string;
  email: string;
}
 

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const { name, email }: RequestBody = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({username: name, email });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {

    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error.name === 'SequelizeValidationError') {
      return NextResponse.json(
        { error: error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();
  
  try {
    // Fetch all users
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest) {
  await dbConnect();
  
  try {
    const { id, name, email } = await request.json();

    // Validate input
    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'ID, name, and email are required' },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await User.findByPk(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    user.username = name;
    user.email = email;
    await user.save();

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    if (error.name === 'SequelizeValidationError') {
      return NextResponse.json(
        { error: error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  
  try {
    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await User.findByPk(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await user.destroy();

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}