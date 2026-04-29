-- ============================================================
-- SQL Function for Gym Application Approval
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_gym_application(application_id UUID)
RETURNS void AS $$
DECLARE
  v_app RECORD;
  v_gym_id UUID;
BEGIN
  -- 1. Fetch application details
  SELECT * INTO v_app FROM public.gym_applications WHERE id = application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_app.status != 'pending' THEN
    RAISE EXCEPTION 'Application is already %', v_app.status;
  END IF;

  -- 2. Create the gym
  INSERT INTO public.gyms (name, city, address, phone, email, status)
  VALUES (v_app.gym_name, v_app.city, v_app.address, v_app.phone, v_app.gym_email, 'active')
  RETURNING id INTO v_gym_id;

  -- 3. Create the gym admin record
  INSERT INTO public.gym_admins (gym_id, user_id, name, email)
  VALUES (v_gym_id, v_app.user_id, v_app.admin_name, v_app.admin_email);

  -- 4. Update the user metadata and confirm the email
  -- This sets the role to gym_admin, links them to the new gym, and marks email as confirmed
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', 'gym_admin', 'gym_id', v_gym_id)
  WHERE id = v_app.user_id;

  -- 5. Mark application as approved
  UPDATE public.gym_applications
  SET status = 'approved', reviewed_at = now()
  WHERE id = application_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
