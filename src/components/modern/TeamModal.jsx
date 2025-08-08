import React, { useState, useEffect } from 'react'
import { X, Users, Plus, Crown, User, Mail, Check, X as XIcon } from 'lucide-react'
import { createTeam, getUserTeams, getTeamMembers, inviteTeamMember, updateTeamMemberRole, acceptTeamInvite, declineTeamInvite } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const TeamModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('teams')
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Create team form
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')

  // Add member form
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('member')

  useEffect(() => {
    if (isOpen) {
      loadTeams()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id)
    }
  }, [selectedTeam])

  const loadTeams = async () => {
    try {
      const { data, error } = await getUserTeams()
      if (error) throw error
      setTeams(data || [])
      if (data && data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0])
      }
    } catch (err) {
      setError('Failed to load teams')
    }
  }

  const loadTeamMembers = async (teamId) => {
    try {
      const { data, error } = await getTeamMembers(teamId)
      if (error) throw error
      setTeamMembers(data || [])
    } catch (err) {
      setError('Failed to load team members')
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await createTeam({
        name: teamName.trim(),
        description: teamDescription.trim()
      })
      
      if (error) throw error
      
      setSuccess('Team created successfully')
      setTeamName('')
      setTeamDescription('')
      loadTeams()
      setActiveTab('teams')
    } catch (err) {
      setError(err.message || 'Failed to create team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (e) => {
    e.preventDefault()
    if (!memberEmail.trim() || !selectedTeam) return

    if (!memberEmail.endsWith('@pulseflow.com')) {
      setError('Email must be from @pulseflow.com domain')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await inviteTeamMember(selectedTeam.id, memberEmail.trim(), memberRole)
      setSuccess(`Invitation sent to ${memberEmail}`)
      setMemberEmail('')
      setMemberRole('member')
      loadTeamMembers(selectedTeam.id)
    } catch (err) {
      setError(err.message || 'Failed to invite member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateTeamMemberRole(memberId, newRole)
      loadTeamMembers(selectedTeam.id)
      setSuccess('Role updated successfully')
    } catch (err) {
      setError('Failed to update role')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Team Management
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your teams and collaborate with others
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My Teams
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Create Team
          </button>
        </div>

        {/* Content */}
        <div className="flex h-96">
          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <>
              {/* Teams List */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Your Teams
                </h3>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{team.name}</span>
                        {team.created_by === user?.id && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      {team.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {team.description}
                        </p>
                      )}
                    </button>
                  ))}
                  
                  {teams.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No teams yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Details */}
              <div className="flex-1 p-4">
                {selectedTeam ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {selectedTeam.name}
                        </h3>
                        {selectedTeam.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {selectedTeam.description}
                          </p>
                        )}
                      </div>
                      {selectedTeam.created_by === user?.id && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>

                    {/* Add Member Form */}
                    {(selectedTeam.created_by === user?.id || 
                      teamMembers.some(m => m.user_id === user?.id && m.role === 'manager')) && (
                      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                          Add Member
                        </h4>
                        <form onSubmit={handleInviteMember} className="flex gap-2">
                          <input
                            type="email"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            placeholder="colleague@pulseflow.com"
                            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm"
                          />
                          <select
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Team Members */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                        Members ({teamMembers.length})
                      </h4>
                      <div className="space-y-2">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {member.profiles?.full_name || member.profiles?.email}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {member.profiles?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(selectedTeam.created_by === user?.id || 
                                (teamMembers.some(m => m.user_id === user?.id && m.role === 'manager') && member.user_id !== user?.id)) ? (
                                <select
                                  value={member.role}
                                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                  className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                  <option value="member">Member</option>
                                  <option value="manager">Manager</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.role === 'manager'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                  {member.role === 'manager' && <Crown className="h-3 w-3 inline mr-1" />}
                                  {member.role}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Select a team to view details
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Create Team Tab */}
          {activeTab === 'create' && (
            <div className="flex-1 p-6">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Brief description of the team"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Team
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Messages */}
        {(error || success) && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamModal