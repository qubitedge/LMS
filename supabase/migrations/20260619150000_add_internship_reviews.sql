create table if not exists public.internship_reviews (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.internship_reviews enable row level security;

create policy "Users can insert their own reviews"
    on public.internship_reviews for insert
    with check (auth.uid() = user_id);

create policy "Admins can view all reviews"
    on public.internship_reviews for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

create policy "Users can view their own reviews"
    on public.internship_reviews for select
    using (auth.uid() = user_id);
