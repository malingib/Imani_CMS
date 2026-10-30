CREATE OR REPLACE FUNCTION public.admin_list_church_memberships(p_church_id UUID)
RETURNS TABLE(id UUID,user_id UUID,church_id UUID,role TEXT,status TEXT,email TEXT,name TEXT,created_at TIMESTAMPTZ,updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_catalog AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF app_role()<>'SUPER_ADMIN' AND NOT EXISTS(SELECT 1 FROM public.church_memberships cm WHERE cm.user_id=auth.uid() AND cm.church_id=p_church_id AND cm.role='ADMIN' AND cm.status='active') THEN RAISE EXCEPTION 'Only a church ADMIN or SUPER_ADMIN can view membership administration'; END IF;
 RETURN QUERY SELECT cm.id,cm.user_id,cm.church_id,cm.role,cm.status,u.email,COALESCE(u.raw_user_meta_data->>'name',u.raw_user_meta_data->>'full_name'),cm.created_at,cm.updated_at FROM public.church_memberships cm JOIN auth.users u ON u.id=cm.user_id WHERE cm.church_id=p_church_id ORDER BY CASE cm.status WHEN 'active' THEN 0 ELSE 1 END, COALESCE(u.email,''),cm.created_at;
END; $$;
REVOKE ALL ON FUNCTION public.admin_list_church_memberships(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_church_memberships(UUID) TO authenticated;;
