-- Secure read model for church administrators.
-- Exposes membership identity fields without granting direct access to auth.users.

ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS website TEXT;

CREATE OR REPLACE FUNCTION public.admin_update_church_profile(
  p_church_id UUID,p_name TEXT,p_address TEXT DEFAULT NULL,p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,p_website TEXT DEFAULT NULL,p_logo_url TEXT DEFAULT NULL)
RETURNS public.churches LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
DECLARE v_church public.churches; v_name TEXT:=trim(COALESCE(p_name,''));
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF app_role()<>'SUPER_ADMIN' AND NOT EXISTS(SELECT 1 FROM public.church_memberships cm WHERE cm.user_id=auth.uid() AND cm.church_id=p_church_id AND cm.role='ADMIN' AND cm.status='active') THEN RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can update church settings'; END IF;
 IF v_name='' THEN RAISE EXCEPTION 'Church name is required'; END IF;
 IF length(v_name)>200 THEN RAISE EXCEPTION 'Church name is too long'; END IF;
 UPDATE public.churches SET name=v_name,address=NULLIF(trim(COALESCE(p_address,'')),''),phone=NULLIF(trim(COALESCE(p_phone,'')),''),email=NULLIF(lower(trim(COALESCE(p_email,''))),''),website=NULLIF(trim(COALESCE(p_website,'')),''),logo_url=NULLIF(trim(COALESCE(p_logo_url,'')),'') WHERE id=p_church_id RETURNING * INTO v_church;
 IF NOT FOUND THEN RAISE EXCEPTION 'Church not found'; END IF;
 INSERT INTO public.audit_logs(user_id,action,module,timestamp,severity,metadata,church_id) VALUES(auth.uid(),'CHURCH_PROFILE_UPDATED','Church Administration',now(),'INFO',jsonb_build_object('church_id',p_church_id),p_church_id);
 RETURN v_church;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_list_church_memberships(p_church_id UUID)
RETURNS TABLE(id UUID,user_id UUID,church_id UUID,role TEXT,status TEXT,email TEXT,name TEXT,created_at TIMESTAMPTZ,updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF app_role()<>'SUPER_ADMIN' AND NOT EXISTS(SELECT 1 FROM public.church_memberships cm WHERE cm.user_id=auth.uid() AND cm.church_id=p_church_id AND cm.role='ADMIN' AND cm.status='active') THEN RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can view membership administration'; END IF;
 RETURN QUERY SELECT cm.id,cm.user_id,cm.church_id,cm.role,cm.status,u.email,COALESCE(u.raw_user_meta_data->>'name',u.raw_user_meta_data->>'full_name'),cm.created_at,cm.updated_at FROM public.church_memberships cm JOIN auth.users u ON u.id=cm.user_id WHERE cm.church_id=p_church_id ORDER BY CASE cm.status WHEN 'active' THEN 0 ELSE 1 END,COALESCE(u.email,''),cm.created_at;
END; $$;

REVOKE ALL ON FUNCTION public.admin_update_church_profile(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_church_memberships(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_church_profile(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_church_memberships(UUID) TO authenticated;
