import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CheckinForm from '@/components/CheckinForm'

export default async function CheckinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  const { data: existingCheckin } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation username={profile?.username ?? 'you'} />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <CheckinForm userId={user.id} existingCheckinId={existingCheckin?.id ?? null} />
      </div>
    </div>
  )
}
