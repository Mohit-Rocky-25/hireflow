export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      text_snapshots: {
        Row: {
          user_id: string;
          hash: string;
          body: string;
          char_count: number;
          word_count: number;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          hash: string;
          body: string;
          char_count: number;
          word_count: number;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          hash?: string;
          body?: string;
          char_count?: number;
          word_count?: number;
          created_at?: string;
        };
      };
      resume_workspaces: {
        Row: {
          user_id: string;
          id: string;
          name: string;
          role_track: string;
          is_primary: boolean;
          head_version_id: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: {
          user_id?: string;
          id: string;
          name: string;
          role_track?: string;
          is_primary?: boolean;
          head_version_id?: string | null;
          created_at: string;
          updated_at: string;
          archived_at?: string | null;
        };
        Update: {
          user_id?: string;
          id?: string;
          name?: string;
          role_track?: string;
          is_primary?: boolean;
          head_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
      };
      resume_versions: {
        Row: {
          user_id: string;
          id: string;
          workspace_id: string;
          parent_version_id: string | null;
          label: string;
          snapshot_hash: string;
          source: 'upload' | 'paste' | 'tailor' | 'branch' | 'manual_edit';
          note: string | null;
          source_file_name: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          workspace_id: string;
          parent_version_id?: string | null;
          label: string;
          snapshot_hash: string;
          source: 'upload' | 'paste' | 'tailor' | 'branch' | 'manual_edit';
          note?: string | null;
          source_file_name?: string | null;
          created_at: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          workspace_id?: string;
          parent_version_id?: string | null;
          label?: string;
          snapshot_hash?: string;
          source?: 'upload' | 'paste' | 'tailor' | 'branch' | 'manual_edit';
          note?: string | null;
          source_file_name?: string | null;
          created_at?: string;
        };
      };
      audit_entries: {
        Row: {
          user_id: string;
          id: string;
          kind: 'ats_roast' | 'talentlens' | 'jd_compare' | 'tailor';
          created_at: string;
          engine_version: string;
          run_key: string;
          target_key: string;
          resume_workspace_id: string | null;
          resume_version_id: string | null;
          resume_snapshot_hash: string;
          resume_label: string;
          jd_snapshot_hash: string;
          jd_meta: Json;
          overall_score: number;
          breakdown: Json;
          gaps: Json;
          strengths: Json;
          evidence: Json;
          findings: Json;
          delta: Json | null;
        };
        Insert: {
          user_id?: string;
          id: string;
          kind: 'ats_roast' | 'talentlens' | 'jd_compare' | 'tailor';
          created_at: string;
          engine_version: string;
          run_key: string;
          target_key: string;
          resume_workspace_id?: string | null;
          resume_version_id?: string | null;
          resume_snapshot_hash: string;
          resume_label: string;
          jd_snapshot_hash: string;
          jd_meta: Json;
          overall_score: number;
          breakdown: Json;
          gaps: Json;
          strengths: Json;
          evidence: Json;
          findings: Json;
          delta?: Json | null;
        };
        Update: {
          user_id?: string;
          id?: string;
          kind?: 'ats_roast' | 'talentlens' | 'jd_compare' | 'tailor';
          created_at?: string;
          engine_version?: string;
          run_key?: string;
          target_key?: string;
          resume_workspace_id?: string | null;
          resume_version_id?: string | null;
          resume_snapshot_hash?: string;
          resume_label?: string;
          jd_snapshot_hash?: string;
          jd_meta?: Json;
          overall_score?: number;
          breakdown?: Json;
          gaps?: Json;
          strengths?: Json;
          evidence?: Json;
          findings?: Json;
          delta?: Json | null;
        };
      };
      journal_events: {
        Row: {
          user_id: string;
          id: string;
          type: string;
          created_at: string;
          target_key: string | null;
          ref_id: string | null;
          summary: string;
          payload: Json | null;
        };
        Insert: {
          user_id?: string;
          id: string;
          type: string;
          created_at: string;
          target_key?: string | null;
          ref_id?: string | null;
          summary: string;
          payload?: Json | null;
        };
        Update: {
          user_id?: string;
          id?: string;
          type?: string;
          created_at?: string;
          target_key?: string | null;
          ref_id?: string | null;
          summary?: string;
          payload?: Json | null;
        };
      };
      watchlist_targets: {
        Row: {
          user_id: string;
          id: string;
          target_key: string;
          company_id: string | null;
          role_id: string | null;
          company_name: string;
          role_title: string | null;
          jd_snapshot_hash: string | null;
          added_at: string;
          archived_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          target_key: string;
          company_id?: string | null;
          role_id?: string | null;
          company_name: string;
          role_title?: string | null;
          jd_snapshot_hash?: string | null;
          added_at: string;
          archived_at?: string | null;
          updated_at: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          target_key?: string;
          company_id?: string | null;
          role_id?: string | null;
          company_name?: string;
          role_title?: string | null;
          jd_snapshot_hash?: string | null;
          added_at?: string;
          archived_at?: string | null;
          updated_at?: string;
        };
      };
      plan_items: {
        Row: {
          user_id: string;
          id: string;
          kind: 'build_brief' | 'credential';
          ref_id: string;
          title: string;
          status: 'planned' | 'in_progress' | 'done';
          linked_gap_ids: Json;
          target_key: string | null;
          added_from_audit_id: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          user_id?: string;
          id: string;
          kind: 'build_brief' | 'credential';
          ref_id: string;
          title: string;
          status: 'planned' | 'in_progress' | 'done';
          linked_gap_ids?: Json;
          target_key?: string | null;
          added_from_audit_id?: string | null;
          note?: string | null;
          created_at: string;
          updated_at: string;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          id?: string;
          kind?: 'build_brief' | 'credential';
          ref_id?: string;
          title?: string;
          status?: 'planned' | 'in_progress' | 'done';
          linked_gap_ids?: Json;
          target_key?: string | null;
          added_from_audit_id?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      outreach_drafts: {
        Row: {
          user_id: string;
          id: string;
          template_id: string;
          channel: string;
          status: 'draft' | 'sent' | 'replied' | 'archived';
          slots: Json;
          rendered_text: string;
          target_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          template_id: string;
          channel: string;
          status: 'draft' | 'sent' | 'replied' | 'archived';
          slots: Json;
          rendered_text: string;
          target_key?: string | null;
          created_at: string;
          updated_at: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          template_id?: string;
          channel?: string;
          status?: 'draft' | 'sent' | 'replied' | 'archived';
          slots?: Json;
          rendered_text?: string;
          target_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gap_status: {
        Row: {
          user_id: string;
          target_key: string;
          gap_id: string;
          status: 'open' | 'addressed_pending_rescan' | 'resolved';
          plan_item_id: string | null;
          still_detected: boolean;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          target_key: string;
          gap_id: string;
          status: 'open' | 'addressed_pending_rescan' | 'resolved';
          plan_item_id?: string | null;
          still_detected?: boolean;
          updated_at: string;
        };
        Update: {
          user_id?: string;
          target_key?: string;
          gap_id?: string;
          status?: 'open' | 'addressed_pending_rescan' | 'resolved';
          plan_item_id?: string | null;
          still_detected?: boolean;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          profile: Json;
          settings: Json;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          profile: Json;
          settings: Json;
          updated_at: string;
        };
        Update: {
          user_id?: string;
          profile?: Json;
          settings?: Json;
          updated_at?: string;
        };
      };
      saved_jds: {
        Row: {
          user_id: string;
          id: string;
          title: string;
          company: string | null;
          source: 'pasted' | 'talentlens' | 'upload';
          text_body: string;
          text_hash: string;
          tags: Json;
          added_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          title: string;
          company?: string | null;
          source: 'pasted' | 'talentlens' | 'upload';
          text_body: string;
          text_hash: string;
          tags?: Json;
          added_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          title?: string;
          company?: string | null;
          source?: 'pasted' | 'talentlens' | 'upload';
          text_body?: string;
          text_hash?: string;
          tags?: Json;
          added_at?: string;
          updated_at?: string;
        };
      };
      user_documents: {
        Row: {
          user_id: string;
          id: string;
          doc_kind: 'resume_upload' | 'jd_upload' | 'exported_pdf' | 'exported_docx' | 'exported_md';
          workspace_id: string | null;
          version_id: string | null;
          audit_id: string | null;
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          byte_size: number;
          sha256: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          doc_kind: 'resume_upload' | 'jd_upload' | 'exported_pdf' | 'exported_docx' | 'exported_md';
          workspace_id?: string | null;
          version_id?: string | null;
          audit_id?: string | null;
          storage_bucket?: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          byte_size: number;
          sha256: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          doc_kind?: 'resume_upload' | 'jd_upload' | 'exported_pdf' | 'exported_docx' | 'exported_md';
          workspace_id?: string | null;
          version_id?: string | null;
          audit_id?: string | null;
          storage_bucket?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          byte_size?: number;
          sha256?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback_items: {
        Row: {
          user_id: string;
          id: string;
          target_kind: string;
          rule_id: string;
          verdict: 'up' | 'down';
          note: string | null;
          audit_id: string | null;
          engine_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          target_kind: string;
          rule_id: string;
          verdict: 'up' | 'down';
          note?: string | null;
          audit_id?: string | null;
          engine_version: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          id?: string;
          target_kind?: string;
          rule_id?: string;
          verdict?: 'up' | 'down';
          note?: string | null;
          audit_id?: string | null;
          engine_version?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      legacy_import_receipts: {
        Row: {
          user_id: string;
          import_key: string;
          imported_at: string;
          record_counts: Json;
          source_summary: Json;
        };
        Insert: {
          user_id?: string;
          import_key: string;
          imported_at?: string;
          record_counts?: Json;
          source_summary?: Json;
        };
        Update: {
          user_id?: string;
          import_key?: string;
          imported_at?: string;
          record_counts?: Json;
          source_summary?: Json;
        };
      };
      tailoring_sessions: {
        Row: {
          user_id: string;
          id: string;
          title: string;
          mode: 'improve' | 'role' | 'jd';
          draft_status: string;
          entry_source: string;
          workspace_id: string | null;
          parent_version_id: string | null;
          source_snapshot_hash: string | null;
          produced_version_id: string | null;
          produced_snapshot_hash: string | null;
          source_audit_id: string | null;
          reanalysis_audit_id: string | null;
          talentlens_assessment_id: string | null;
          dual_jd_comparison_id: string | null;
          target_role: string;
          target_industry: string;
          target_seniority: string;
          jd_title: string;
          jd_company: string;
          jd_snapshot_hash: string | null;
          layout_id: string;
          document_state: Json;
          user_confirmations: Json;
          baseline_score: number | null;
          reanalysis_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          title: string;
          mode: 'improve' | 'role' | 'jd';
          draft_status: string;
          entry_source: string;
          workspace_id?: string | null;
          parent_version_id?: string | null;
          source_snapshot_hash?: string | null;
          produced_version_id?: string | null;
          produced_snapshot_hash?: string | null;
          source_audit_id?: string | null;
          reanalysis_audit_id?: string | null;
          talentlens_assessment_id?: string | null;
          dual_jd_comparison_id?: string | null;
          target_role?: string;
          target_industry?: string;
          target_seniority?: string;
          jd_title?: string;
          jd_company?: string;
          jd_snapshot_hash?: string | null;
          layout_id?: string;
          document_state?: Json;
          user_confirmations?: Json;
          baseline_score?: number | null;
          reanalysis_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          mode?: 'improve' | 'role' | 'jd';
          draft_status?: string;
          produced_version_id?: string | null;
          produced_snapshot_hash?: string | null;
          reanalysis_audit_id?: string | null;
          document_state?: Json;
          user_confirmations?: Json;
          baseline_score?: number | null;
          reanalysis_score?: number | null;
          updated_at?: string;
        };
      };
      tailoring_changes: {
        Row: {
          user_id: string;
          id: string;
          session_id: string;
          section_id: string;
          bullet_id: string | null;
          original_text: string;
          proposed_text: string;
          provenance_kind: string;
          evidence_class: string;
          truth_gate_passed: boolean;
          status: 'pending' | 'accepted' | 'rejected' | 'edited';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          session_id: string;
          section_id: string;
          bullet_id?: string | null;
          original_text: string;
          proposed_text: string;
          provenance_kind: string;
          evidence_class: string;
          truth_gate_passed: boolean;
          status: 'pending' | 'accepted' | 'rejected' | 'edited';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          proposed_text?: string;
          truth_gate_passed?: boolean;
          status?: 'pending' | 'accepted' | 'rejected' | 'edited';
          updated_at?: string;
        };
      };
      export_artifacts: {
        Row: {
          user_id: string;
          id: string;
          session_id: string | null;
          source_version_id: string | null;
          source_audit_id: string | null;
          format: 'pdf' | 'docx' | 'md';
          file_name: string;
          byte_size: number;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          id: string;
          session_id?: string | null;
          source_version_id?: string | null;
          source_audit_id?: string | null;
          format: 'pdf' | 'docx' | 'md';
          file_name: string;
          byte_size: number;
          created_at?: string;
        };
        Update: {
          file_name?: string;
        };
      };
    };
    Functions: {
      erase_my_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}
