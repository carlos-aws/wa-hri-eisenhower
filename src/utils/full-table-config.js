import * as React from 'react';
import { Link } from '@cloudscape-design/components';
import { replaceHtmlTags } from './utilities';

export function getMatchesCountText(count) {
  return count === 1 ? `1 match` : `${count} matches`;
}

function createLabelFunction(columnName) {
  return ({ sorted, descending }) => {
    const sortState = sorted ? `sorted ${descending ? 'descending' : 'ascending'}` : 'not sorted';
    return `${columnName}, ${sortState}.`;
  };
}

export const fullColumnDefinitions = [
    {
      id: "name",
      header: "Name",
      cell: (item) => item.TrustedAdvisorCheckName || "-",
      ariaLabel: createLabelFunction('Name'),
      sortingField: 'name'
    },
    {
      id: "description",
      header: "Description",
      cell: (item) => <span>{replaceHtmlTags(item.TrustedAdvisorCheckDesc)}</span> || "-",
      ariaLabel: createLabelFunction('Description'),
      sortingField: 'description'
    },
    {
      id: "bestPractice",
      header: "Best Practice",
      cell: (item) => (
        <Link external href={'https://docs.aws.amazon.com/wellarchitected/latest/framework/' + item.WABestPracticeId + '.html'}>{item.WABestPracticeTitle || "-"}</Link>
      ),
      ariaLabel: createLabelFunction('Best Practice'),
      sortingField: 'bestPractice'
    },
    {
      id: "pillar",
      header: "Pillar",
      cell: (item) => item.WAPillarId || "-",
      ariaLabel: createLabelFunction('Pillar'),
      sortingField: 'pillar'
    },
    {
      id: "businessRisk",
      header: "Business Risk",
      cell: (item) => item.WABestPracticeRisk || "-",
      ariaLabel: createLabelFunction('Business Risk'),
      sortingField: 'businessRisk'
    },
    {
        id: "resourceId",
        header: "Resource at Risk",
        cell: (item) => item.resourceId || "-",
        ariaLabel: createLabelFunction('Resource at Risk'),
        sortingField: 'resourceId'
    },
    {
      id: "resourceRaw",
      header: "Resource at Risk (Raw)",
      cell: (item) => JSON.stringify(item.FlaggedResources, null, 4) || "-",
      ariaLabel: createLabelFunction('Resource at Risk (Raw)'),
      sortingField: 'resourceRaw'
    },
];

export const paginationLabels = {
  nextPageLabel: 'Next page',
  pageLabel: pageNumber => `Go to page ${pageNumber}`,
  previousPageLabel: 'Previous page',
};

const pageSizePreference = {
  title: 'Select page size',
  options: [
    { value: 10, label: '10 resources' },
    { value: 20, label: '20 resources' },
  ],
};

const visibleContentPreference = {
  title: 'Select visible content',
  options: [
    {
      label: 'Main properties',
      options: fullColumnDefinitions.map(({ id, header }) => ({ id, label: header, editable: id !== 'name' })),
    },
  ],
};
export const collectionPreferencesProps = {
  pageSizePreference,
  visibleContentPreference,
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm',
  title: 'Preferences',
};