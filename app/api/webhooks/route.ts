import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/usage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabaseUserId = session.metadata?.supabaseUserId;
      
      if (!supabaseUserId) {
        console.error('No supabaseUserId in checkout session metadata');
        return NextResponse.json({ error: 'User not found' }, { status: 400 });
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true,
          stripe_customer_id: session.customer as string,
        })
        .eq('id', supabaseUserId);

      if (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }

      console.log(`User ${supabaseUserId} upgraded to Pro`);
      break;
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (fetchError || !profile) {
        console.error('User not found for customer:', customerId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isPro = subscription.status === 'active' || subscription.status === 'trialing';
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_pro: isPro })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
      }

      console.log(`User ${profile.id} subscription updated: ${isPro ? 'active' : 'inactive'}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
