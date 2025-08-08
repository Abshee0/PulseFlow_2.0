import React, { useState } from 'react'
import { useEffect } from 'react'
import { X, Mail, UserPlus, Copy, Check } from 'lucide-react'
import { getBoardShares, supabase } from '../../lib/supabase'

const ShareBoardModal = ({ board, isOpen, onClose, onShare }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [owner, setOwner] = useState(null)
  const [loadingCollaborators, setLoadingCollaborators] = useState(false)

  useEffect(() => {
    if (isOpen && board) {
      loadCollaborators()
    }
  }, [isOpen, board])

  const loadCollaborators = async () => {
    setLoadingCollaborators(true)
    try {
      // Load board owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', board.created_by || board.user_id)
        .maybeSingle()

      if (!ownerError && ownerData) {
        setOwner(ownerData)
      }

      // Load collaborators
      // Get board shares first
      const { data: sharesData, error: sharesError } = await supabase
        .from('board_shares')
        .select('*')
        .eq('board_id', board.id)

      if (sharesError) {
        console.error('Error loading board shares:', sharesError)
        setCollaborators([])
      } else {
        // Then get profile data for each share
        const collaboratorsWithProfiles = []
        for (const share of sharesData || []) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', share.user_id)
            .maybeSingle()
          
          collaboratorsWithProfiles.push({
            ...share,
            profiles: profileData
          })
        }
        setCollaborators(collaboratorsWithProfiles)
      }
    } catch (err) {
      console.error('Error loading collaborators:', err)
    } finally {
      setLoadingCollaborators(false)
    }
  }

  const handleShare = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    if (!email.endsWith('@pulseflow.com')) {
      setError('Email must be from @pulseflow.com domain')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await onShare(board.id, email)
      setSuccess(`Board shared with ${email}`)
      setEmail('')
      loadCollaborators() // Refresh collaborators list
    } catch (err) {
      setError(err.message || 'Failed to share board')
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/board/${board.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Share "{board.name}"
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share by Email */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              Invite by email
            </h3>
            <form onSubmit={handleShare} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@pulseflow.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Send Invite
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Copy Link */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              Or copy link
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/board/${board.id}`}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
              />
              <button
                onClick={copyInviteLink}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
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

          {/* Current Collaborators */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              People with access
            </h3>
            
            {loadingCollaborators ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Owner */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {owner?.full_name?.charAt(0) || owner?.email?.charAt(0) || 'O'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {owner?.full_name || owner?.email || 'Owner'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Owner</p>
                  </div>
                </div>
                
                {/* Collaborators */}
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {collaborator.profiles?.full_name?.charAt(0) || collaborator.profiles?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {collaborator.profiles?.full_name || collaborator.profiles?.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {collaborator.permission || 'View'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {collaborators.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No other members yet
                  </p>
                )}
              </div>
              
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareBoardModal