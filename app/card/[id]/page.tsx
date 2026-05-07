import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RecoveryCard from '@/components/RecoveryCard'
import CardActions from '@/components/CardActions'
import { CheckIn } from '@/lib/types'
import Link from 'next/link'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('check_ins')
    .select('*, profiles(username, full_name)')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const checkin = data as CheckIn & { profiles: { username: string } }
  const username = checkin.profiles?.username ?? 'athlete'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 mb-8 self-start max-w-md w-full mx-auto">
        ← Back
      </Link>
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex justify-center">
          <RecoveryCard checkin={checkin} username={username} />
        </div>
        <CardActions checkinId={id} />
      </div>
    </div>
  )
}
