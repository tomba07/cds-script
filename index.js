const fs = require('fs');

const inputJson = {
  serviceName: 'testService.testEntity',
  facets: [
    {
      type: 'collection',
      label: 'Collection',
      facets: [
        {
          type: 'fieldGroup',
          label: 'Field Group',
          data: [
            { label: 'Test Label', value: 'testField' }
          ]
        }
      ]
    }
  ]
};

function toI18nKey(label) {
  return label.toLowerCase().replace(/\s+/g, '');
}

// A function to add indentation
function indent(level) {
  return ' '.repeat(level * 4); // Adjust the number 4 to increase or decrease indentation width
}

function generateCDSAnnotationsAndI18n(input) {
  let cdsAnnotationsLines = [
    `annotate ${input.serviceName} with @(UI.Facets: [`
  ];
  let i18nTranslations = {};

  input.facets.forEach((facet) => {
    if (facet.type === 'collection') {
      const collectionI18nKey = toI18nKey(facet.label);
      cdsAnnotationsLines.push(`${indent(1)}{`);
      cdsAnnotationsLines.push(`${indent(2)}$Type : 'UI.CollectionFacet',`);
      cdsAnnotationsLines.push(`${indent(2)}Label : '{i18n>${collectionI18nKey}}',`);
      cdsAnnotationsLines.push(`${indent(2)}Facets: [`);
      i18nTranslations[collectionI18nKey] = facet.label;
      
      facet.facets.forEach((subFacet) => {
        if (subFacet.type === 'fieldGroup') {
          const fieldGroupI18nKey = toI18nKey(subFacet.label);
          cdsAnnotationsLines.push(`${indent(3)}{`);
          cdsAnnotationsLines.push(`${indent(4)}$Type : 'UI.ReferenceFacet',`);
          cdsAnnotationsLines.push(`${indent(4)}Label : '{i18n>${fieldGroupI18nKey}}',`);
          cdsAnnotationsLines.push(`${indent(4)}ID    : '${fieldGroupI18nKey}',`);
          cdsAnnotationsLines.push(`${indent(4)}Target: '@UI.FieldGroup#${fieldGroupI18nKey}',`);
          cdsAnnotationsLines.push(`${indent(3)}},`);
          i18nTranslations[fieldGroupI18nKey] = subFacet.label;

          subFacet.data.forEach(dataItem => {
            const dataItemI18nKey = toI18nKey(dataItem.label);
            i18nTranslations[dataItemI18nKey] = dataItem.label;
          });
        }
      });
      cdsAnnotationsLines.push(`${indent(2)}]`);
      cdsAnnotationsLines.push(`${indent(1)}},`);
    }
  });

  cdsAnnotationsLines.push(`]);`);
  const cdsAnnotations = cdsAnnotationsLines.join('\n');

  const i18nTranslationsContent = Object.entries(i18nTranslations)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  return { cdsAnnotations, i18nTranslationsContent };
}

const { cdsAnnotations, i18nTranslationsContent } = generateCDSAnnotationsAndI18n(inputJson);

console.log("CDS Annotations:\n", cdsAnnotations);
console.log("i18n Translations:\n", i18nTranslationsContent);

// Optionally, you can write these outputs to files
// fs.writeFileSync('cdsAnnotations.cds', cdsAnnotations);
// fs.writeFileSync('i18nTranslations.properties', i18nTranslationsContent);
