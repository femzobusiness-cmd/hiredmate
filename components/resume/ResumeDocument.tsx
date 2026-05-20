'use client';

import type { GeneratedResumeContent, ResumeFormData } from '@/lib/resume';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  headerName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  contact: { fontSize: 9, color: '#6b7280', marginBottom: 8 },
  divider: {
    height: 2,
    backgroundColor: '#7C5CBF',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7C5CBF',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summary: {
    fontStyle: 'italic',
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  jobTitle: { fontSize: 11, fontWeight: 'bold' },
  jobMeta: { fontSize: 9, color: '#6b7280', marginBottom: 4 },
  bullet: { marginLeft: 8, marginBottom: 3, lineHeight: 1.35 },
  pill: {
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    padding: '2 6',
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    fontSize: 8,
  },
  modernPage: { flexDirection: 'row', padding: 0 },
  sidebar: {
    width: '32%',
    backgroundColor: '#7C5CBF',
    color: '#fff',
    padding: 24,
  },
  main: { width: '68%', padding: 24 },
  sidebarName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sidebarText: { fontSize: 8, marginBottom: 4, lineHeight: 1.3 },
});

interface ResumeDocumentProps {
  formData: ResumeFormData;
  generated: GeneratedResumeContent;
}

function ClassicResume({ formData, generated }: ResumeDocumentProps) {
  const { personal } = formData;
  const contact = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedIn,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.headerName}>{personal.fullName}</Text>
        <Text style={styles.contact}>{contact}</Text>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{generated.professionalSummary}</Text>

        <Text style={styles.sectionTitle}>Work Experience</Text>
        {generated.workExperience.map((job, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <Text style={styles.jobMeta}>
              {job.employer} | {job.location} | {job.startDate} – {job.endDate}
              {job.unit ? ` | ${job.unit}` : ''}
            </Text>
            {job.bullets.map((b, j) => (
              <Text key={j} style={styles.bullet}>
                • {b}
              </Text>
            ))}
          </View>
        ))}

        {(generated.education?.length ?? 0) > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {generated.education!.map((ed, i) => (
              <Text key={i} style={styles.bullet}>
                {ed.degree}, {ed.schoolName} ({ed.graduationYear})
                {ed.honors ? ` — ${ed.honors}` : ''}
              </Text>
            ))}
          </>
        )}

        {(generated.certifications?.length ?? 0) > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {generated.certifications!.map((c, i) => (
                <Text key={i} style={styles.pill}>
                  {c}
                </Text>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.bullet}>
          Clinical: {(generated.clinicalSkills || []).join(', ')}
        </Text>
        <Text style={styles.bullet}>
          Professional: {(generated.softSkills || []).join(', ')}
        </Text>
      </Page>
    </Document>
  );
}

function ModernResume({ formData, generated }: ResumeDocumentProps) {
  const { personal } = formData;

  return (
    <Document>
      <Page size="LETTER" style={styles.modernPage}>
        <View style={styles.sidebar}>
          <Text style={styles.sidebarName}>{personal.fullName}</Text>
          <Text style={styles.sidebarText}>{personal.email}</Text>
          <Text style={styles.sidebarText}>{personal.phone}</Text>
          <Text style={styles.sidebarText}>{personal.location}</Text>
          {personal.linkedIn ? (
            <Text style={styles.sidebarText}>{personal.linkedIn}</Text>
          ) : null}

          <Text style={[styles.sectionTitle, { color: '#fff', marginTop: 16 }]}>
            Certifications
          </Text>
          {(generated.certifications || []).map((c, i) => (
            <Text key={i} style={styles.sidebarText}>
              • {c}
            </Text>
          ))}

          <Text style={[styles.sectionTitle, { color: '#fff', marginTop: 12 }]}>
            Skills
          </Text>
          {(generated.clinicalSkills || []).slice(0, 8).map((s, i) => (
            <Text key={i} style={styles.sidebarText}>
              • {s}
            </Text>
          ))}
        </View>

        <View style={styles.main}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{generated.professionalSummary}</Text>

          <Text style={styles.sectionTitle}>Experience</Text>
          {generated.workExperience.map((job, i) => (
            <View key={i}>
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={styles.jobMeta}>
                {job.employer} · {job.startDate} – {job.endDate}
              </Text>
              {job.bullets.map((b, j) => (
                <Text key={j} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ))}

          {(generated.education?.length ?? 0) > 0 && (
            <>
              <Text style={styles.sectionTitle}>Education</Text>
              {generated.education!.map((ed, i) => (
                <Text key={i} style={styles.bullet}>
                  {ed.degree}, {ed.schoolName} ({ed.graduationYear})
                </Text>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}

export function ResumeDocument(props: ResumeDocumentProps) {
  return props.formData.format === 'modern' ? (
    <ModernResume {...props} />
  ) : (
    <ClassicResume {...props} />
  );
}
