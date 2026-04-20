import type { CategoryAttributeDefinition } from '../entities/category-attribute.types';

export interface DefaultCategorySeed {
  name: string;
  attributes: CategoryAttributeDefinition[];
}

/** PLAN.md — Seed Data — Default Categories */
export const DEFAULT_CATEGORIES: DefaultCategorySeed[] = [
  {
    name: 'Resistor',
    attributes: [
      { key: 'resistance', label: 'Resistance', unit: 'Ω', type: 'number' },
      { key: 'tolerance', label: 'Tolerance', unit: '%', type: 'number' },
      { key: 'power', label: 'Power', unit: 'W', type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'Capacitor',
    attributes: [
      { key: 'capacitance', label: 'Capacitance', unit: 'µF', type: 'number' },
      { key: 'voltage', label: 'Voltage', unit: 'V', type: 'number' },
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['ceramic', 'electrolytic', 'film', 'tantalum'],
      },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'Inductor',
    attributes: [
      { key: 'inductance', label: 'Inductance', unit: 'µH', type: 'number' },
      { key: 'current', label: 'Current', unit: 'A', type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'Diode',
    attributes: [
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['rectifier', 'zener', 'schottky', 'led'],
      },
      { key: 'voltage', label: 'Voltage', unit: 'V', type: 'number' },
      { key: 'current', label: 'Current', unit: 'A', type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'MOSFET',
    attributes: [
      {
        key: 'channel',
        label: 'Channel',
        unit: null,
        type: 'enum',
        options: ['N', 'P'],
      },
      { key: 'vds', label: 'Vds', unit: 'V', type: 'number' },
      { key: 'id', label: 'Id', unit: 'A', type: 'number' },
      { key: 'rds', label: 'Rds(on)', unit: 'mΩ', type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'BJT',
    attributes: [
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['NPN', 'PNP'],
      },
      { key: 'vceo', label: 'Vceo', unit: 'V', type: 'number' },
      { key: 'ic', label: 'Ic', unit: 'A', type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'Op-amp',
    attributes: [
      { key: 'supply_voltage', label: 'Supply voltage', unit: 'V', type: 'number' },
      { key: 'channels', label: 'Channels', unit: null, type: 'number' },
      {
        key: 'package',
        label: 'Package',
        unit: null,
        type: 'enum',
        options: ['0402', '0603', '0805', '1206', 'THT'],
      },
    ],
  },
  {
    name: 'IC (generic)',
    attributes: [
      { key: 'package', label: 'Package', unit: null, type: 'text' },
      { key: 'function', label: 'Function', unit: null, type: 'text' },
    ],
  },
  {
    name: 'Screw/Bolt',
    attributes: [
      { key: 'thread', label: 'Thread', unit: null, type: 'text' },
      { key: 'length', label: 'Length', unit: 'mm', type: 'number' },
      {
        key: 'head',
        label: 'Head',
        unit: null,
        type: 'enum',
        options: ['socket', 'pan', 'countersunk', 'hex'],
      },
      {
        key: 'material',
        label: 'Material',
        unit: null,
        type: 'enum',
        options: ['steel', 'stainless', 'nylon'],
      },
    ],
  },
  {
    name: 'Nut',
    attributes: [
      { key: 'thread', label: 'Thread', unit: null, type: 'text' },
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['standard', 'nylon-insert', 'flange'],
      },
      {
        key: 'material',
        label: 'Material',
        unit: null,
        type: 'enum',
        options: ['steel', 'stainless', 'nylon'],
      },
    ],
  },
  {
    name: 'Standoff',
    attributes: [
      { key: 'thread', label: 'Thread', unit: null, type: 'text' },
      { key: 'length', label: 'Length', unit: 'mm', type: 'number' },
      {
        key: 'gender',
        label: 'Gender',
        unit: null,
        type: 'enum',
        options: ['M-F', 'F-F', 'M-M'],
      },
      {
        key: 'material',
        label: 'Material',
        unit: null,
        type: 'enum',
        options: ['steel', 'stainless', 'nylon'],
      },
    ],
  },
  {
    name: 'Connector',
    attributes: [
      { key: 'type', label: 'Type', unit: null, type: 'text' },
      { key: 'pins', label: 'Pins', unit: null, type: 'number' },
      { key: 'pitch', label: 'Pitch', unit: 'mm', type: 'number' },
      {
        key: 'gender',
        label: 'Gender',
        unit: null,
        type: 'enum',
        options: ['male', 'female', 'both'],
      },
    ],
  },
  {
    name: 'Wire/Cable',
    attributes: [
      { key: 'gauge', label: 'Gauge', unit: null, type: 'text' },
      {
        key: 'type',
        label: 'Type',
        unit: null,
        type: 'enum',
        options: ['solid', 'stranded', 'coax', 'ribbon'],
      },
      { key: 'color', label: 'Color', unit: null, type: 'text' },
    ],
  },
  {
    name: 'PCB',
    attributes: [
      { key: 'width', label: 'Width', unit: 'mm', type: 'number' },
      { key: 'height', label: 'Height', unit: 'mm', type: 'number' },
      { key: 'layers', label: 'Layers', unit: null, type: 'number' },
    ],
  },
  {
    name: 'Misc',
    attributes: [],
  },
];
