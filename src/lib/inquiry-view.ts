import type { Inquiry } from './types';
import { proposalView, type StoredProposal } from './proposals/model';

type StoredInquiry = Inquiry & { proposal?: StoredProposal; receiptLease?: unknown; submissionHash?: string };

export function adminInquiry({ receiptLease: _lease, submissionHash: _submission, proposal, ...data }: StoredInquiry): Inquiry {
  return { ...data, ...(proposal ? { proposal: proposalView(proposal) } : {}) };
}

// The CMS overview loads at most this many inquiries and only the beginning of long messages, so a flood of
// large submissions cannot push the CMS start past the response size limit. An opened inquiry loads its full text.
export const inquiryPreviewLength = 2000;
export const inquiryOverviewLimit = 1000;
export function inquiryPreview(inquiry: Inquiry): Inquiry {
  return inquiry.message.length > inquiryPreviewLength ? { ...inquiry, message: inquiry.message.slice(0, inquiryPreviewLength), messageLength: inquiry.message.length } : inquiry;
}
