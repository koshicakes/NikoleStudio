-- Secure customer reviews for Nikole Studio.
-- Run this in the Supabase SQL editor after the bookings table exists.

create table if not exists public.reviews (
    id bigserial primary key,
    booking_id integer not null references public.bookings(id) on delete cascade,
    customer_name text not null,
    email text not null,
    service_type text,
    rating integer not null check (rating between 1 and 5),
    message text not null,
    status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz,
    constraint reviews_one_per_booking unique (booking_id)
);

create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);
create index if not exists reviews_booking_email_idx on public.reviews (booking_id, lower(email));

create or replace function public.set_review_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();

    if new.status = 'published' and old.status is distinct from 'published' then
        new.published_at = now();
    elsif new.status is distinct from 'published' then
        new.published_at = null;
    end if;

    return new;
end;
$$;

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_review_updated_at();

create or replace function public.validate_review_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    matched_booking public.bookings%rowtype;
begin
    select *
      into matched_booking
      from public.bookings
     where id = new.booking_id;

    if not found then
        raise exception 'Review rejected: booking_id does not exist.';
    end if;

    if lower(trim(new.email)) <> lower(trim(matched_booking.email)) then
        raise exception 'Review rejected: review email must match the booking email.';
    end if;

    if matched_booking.status <> 'completed' then
        raise exception 'Review rejected: only completed bookings can be reviewed.';
    end if;

    if new.customer_name is null or trim(new.customer_name) = '' then
        new.customer_name = matched_booking.customer_name;
    end if;

    new.email = lower(trim(new.email));

    if new.service_type is null or trim(new.service_type) = '' then
        new.service_type = matched_booking.service_type;
    elsif matched_booking.service_type is not null and new.service_type <> matched_booking.service_type then
        raise exception 'Review rejected: service_type must match the completed booking.';
    end if;

    if tg_op = 'INSERT' then
        new.status = 'pending';
        new.published_at = null;
    end if;

    return new;
end;
$$;

drop trigger if exists trg_reviews_validate_booking on public.reviews;
create trigger trg_reviews_validate_booking
before insert or update of booking_id, email, customer_name, service_type, rating, message
on public.reviews
for each row execute function public.validate_review_booking();

alter table public.reviews enable row level security;

drop policy if exists "Anyone can submit eligible reviews" on public.reviews;
create policy "Anyone can submit eligible reviews"
on public.reviews
for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Anyone can read published reviews" on public.reviews;
create policy "Anyone can read published reviews"
on public.reviews
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authenticated staff can read all reviews" on public.reviews;
create policy "Authenticated staff can read all reviews"
on public.reviews
for select
to authenticated
using (true);

drop policy if exists "Authenticated staff can update reviews" on public.reviews;
create policy "Authenticated staff can update reviews"
on public.reviews
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated staff can delete reviews" on public.reviews;
create policy "Authenticated staff can delete reviews"
on public.reviews
for delete
to authenticated
using (true);

create or replace view public.published_reviews as
select
    id,
    booking_id,
    customer_name,
    service_type,
    rating,
    message,
    coalesce(published_at, created_at) as review_date
from public.reviews
where status = 'published'
order by coalesce(published_at, created_at) desc;

create or replace view public.review_rating_summary as
select
    coalesce(round(avg(rating)::numeric, 2), 0) as average_rating,
    count(*)::integer as total_reviews
from public.reviews
where status = 'published';

grant select on public.published_reviews to anon, authenticated;
grant select on public.review_rating_summary to anon, authenticated;
grant insert on public.reviews to anon, authenticated;
grant select, update, delete on public.reviews to authenticated;
grant usage, select on sequence public.reviews_id_seq to anon, authenticated;
