import { User } from 'lucide-react';
import { Section, Container, Heading, Card } from '../ui';
import useScrollReveal from '../../../hooks/useScrollReveal';
import type { PublicTeamMember } from '../../../services/publicApi';

// Team tiles — content is admin-managed (About Page editor stores them as
// "founders"; the API field name is part of the contract and stays).
// Renders nothing when no members exist.

interface TeamSectionProps {
  members: PublicTeamMember[];
}

function MemberAvatar({ member }: { member: PublicTeamMember }) {
  const sizing =
    'shrink-0 rounded-full w-[clamp(96px,12vw,140px)] h-[clamp(96px,12vw,140px)]';
  if (member.photoBase64) {
    return (
      <img
        src={`data:image/*;base64,${member.photoBase64}`}
        alt={member.name}
        loading="lazy"
        decoding="async"
        className={`${sizing} object-cover border-[3px] border-[rgba(232,93,42,0.25)]`}
      />
    );
  }
  return (
    <div className={`${sizing} flex items-center justify-center bg-[rgba(232,93,42,0.10)]`}>
      <User size={44} color="var(--color-accent)" />
    </div>
  );
}

function MemberCard({ member }: { member: PublicTeamMember }) {
  return (
    <Card className="max-w-none">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5 sm:gap-6 p-6">
        <MemberAvatar member={member} />
        <div className="flex-1 min-w-0">
          <h3 className="m-0 mb-1 text-xl font-semibold [font-family:var(--font-heading)] text-[var(--color-text)]">
            {member.name}
          </h3>
          {member.role && (
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide [font-family:var(--font-body)] text-[var(--color-accent)]">
              {member.role}
            </div>
          )}
          {member.bio && (
            <p className="m-0 text-base leading-relaxed text-pretty whitespace-pre-line [font-family:var(--font-body)] text-[var(--color-text-muted)]">
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function TeamSection({ members }: TeamSectionProps) {
  const ref = useScrollReveal();
  if (members.length === 0) return null;

  return (
    <Section tone="alt">
      <Container>
        <div ref={ref} className="text-center mb-10">
          <Heading level={2} style={{ display: 'inline-block' }}>Team</Heading>
        </div>
        {members.length === 1 ? (
          <div className="max-w-3xl mx-auto">
            <MemberCard member={members[0]} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {members.map((m, i) => (
              <MemberCard key={`${m.name}-${i}`} member={m} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

export default TeamSection;
