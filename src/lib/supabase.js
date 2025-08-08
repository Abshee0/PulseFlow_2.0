import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export const createBoard = async (board) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('boards')
    .insert([{
      ...board,
      user_id: user.id,
      created_by: user.id
    }])
    .select()
    .single()

  return { data, error }
}

export const getUserBoards = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // First get board IDs that are shared with the user
  const { data: sharedBoards, error: sharedError } = await supabase
    .from('board_shares')
    .select('board_id')
    .eq('user_id', user.id)

  if (sharedError) {
    return { data: null, error: sharedError }
  }

  const sharedBoardIds = sharedBoards.map(share => share.board_id)

  // Build the query for boards owned by user or shared with user
  let query = supabase
    .from('boards')
    .select('*')

  if (sharedBoardIds.length > 0) {
    query = query.or(`user_id.eq.${user.id},id.in.(${sharedBoardIds.join(',')})`)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query

  return { data, error }
}

export const shareBoard = async (boardId, userEmail) => {
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (userError || !user) {
    throw new Error('User not found')
  }

  const { data, error } = await supabase
    .from('board_shares')
    .insert([{
      board_id: boardId,
      user_id: user.id
    }])

  return { data, error }
}

// Board CRUD operations
export const updateBoard = async (boardId, boardData) => {
  const { data, error } = await supabase
    .from('boards')
    .update(boardData)
    .eq('id', boardId)
    .select()
    .single()

  return { data, error }
}

export const deleteBoard = async (boardId) => {
  const { data, error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)

  return { data, error }
}

// Task CRUD operations
export const createTask = async (taskData) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      ...taskData,
      created_by: user.id
    }])
    .select()
    .single()

  return { data, error }
}

export const updateTask = async (taskId, taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .select()
    .single()

  return { data, error }
}

export const deleteTask = async (taskId) => {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  return { data, error }
}

// Get board shares with user details
export const getBoardShares = async (boardId) => {
  const { data, error } = await supabase
    .from('board_shares')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .eq('board_id', boardId)

  return { data, error }
}

// Get tasks for a board
export const getBoardTasks = async (boardId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true })

  return { data, error }
}

// Feedback operations
export const createFeedback = async (message) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('feedback')
    .insert([{
      message,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email
    }])
    .select()
    .single()

  return { data, error }
}

export const getFeedback = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Subscribe to feedback changes
export const subscribeFeedback = (callback) => {
  return supabase
    .channel('feedback')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, callback)
    .subscribe()
}

// Update user profile
export const updateUserProfile = async (updates) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Update auth user metadata
  const { data: authData, error: authError } = await supabase.auth.updateUser({
    data: updates
  })

  if (authError) return { data: null, error: authError }

  // Update profile table if it exists
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: updates.full_name,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data: { auth: authData, profile: profileData }, error: profileError }
}

// Change password
export const changePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  return { data, error }
}

// Team operations
export const createTeam = async (teamData) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('teams')
    .insert([{
      ...teamData,
      created_by: user.id
    }])
    .select()
    .single()

  return { data, error }
}

export const getUserTeams = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // First get team IDs where user is an accepted member
  const { data: memberTeams, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  if (memberError) {
    return { data: null, error: memberError }
  }

  const memberTeamIds = memberTeams.map(member => member.team_id)

  // Build the query for teams created by user or where user is a member
  let query = supabase
    .from('teams')
    .select('*')

  if (memberTeamIds.length > 0) {
    query = query.or(`created_by.eq.${user.id},id.in.(${memberTeamIds.join(',')})`)
  } else {
    query = query.eq('created_by', user.id)
  }

  const { data, error } = await query

  return { data, error }
}

export const getTeamMembers = async (teamId) => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .eq('team_id', teamId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: true })

  return { data, error }
}

export const inviteTeamMember = async (teamId, userEmail, role = 'member') => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Find user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([{
      team_id: teamId,
      user_id: userData.id,
      role,
      invited_by: user.id
    }])
    .select()
    .single()

  return { data, error }
}

export const updateTeamMemberRole = async (memberId, role) => {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()

  return { data, error }
}

export const acceptTeamInvite = async (memberId) => {
  const { data, error } = await supabase
    .from('team_members')
    .update({ status: 'accepted' })
    .eq('id', memberId)
    .select()
    .single()

  return { data, error }
}

export const declineTeamInvite = async (memberId) => {
  const { data, error } = await supabase
    .from('team_members')
    .update({ status: 'declined' })
    .eq('id', memberId)
    .select()
    .single()

  return { data, error }
}

// Notification operations
export const getUserNotifications = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data, error }
}

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  return { data, error }
}

export const markAllNotificationsAsRead = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return { data, error }
}

export const deleteNotification = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  return { data, error }
}

// Subscribe to notifications
export const subscribeNotifications = (callback) => {
  const user = getCurrentUser()
  if (!user) return null

  return supabase
    .channel('notifications')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, callback)
    .subscribe()
}

// Get tasks due in 24 hours
export const getTasksDueSoon = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      boards(name)
    `)
    .lte('dueDate', tomorrow.toISOString())
    .gte('dueDate', new Date().toISOString())
    .eq('created_by', user.id)
    .order('dueDate', { ascending: true })

  return { data, error }
}

// Real-time subscriptions for better UX
export const subscribeToBoard = (boardId, callback) => {
  return supabase
    .channel(`board-${boardId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `board_id=eq.${boardId}`
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'boards',
      filter: `id=eq.${boardId}`
    }, callback)
    .subscribe()
}