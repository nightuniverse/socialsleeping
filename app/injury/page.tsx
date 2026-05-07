import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import InjuryAssessment from '@/components/InjuryAssessment'

export default async function InjuryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation username={profile?.username ?? 'you'} />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <InjuryAssessment />
      </div>
    </div>
  )
}
