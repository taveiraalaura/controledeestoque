import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Material, Requisition } from '../types';

// Formatador de Moeda BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatador de Data BRL
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Gera e baixa o PDF de Requisição de Materiais
 */
export function generateRequisitionPDF(requisition: Requisition): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Cabeçalho institucional (Azul Marinho)
  doc.setFillColor(15, 23, 42); // #0F172A (slate-900)
  doc.rect(0, 0, 210, 32, 'F');

  // Faixa de destaque amarelo
  doc.setFillColor(245, 158, 11); // #F59E0B (amber-500)
  doc.rect(0, 32, 210, 3, 'F');

  // Título e Subtítulo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE GESTÃO DE ESTOQUE E ALMOXARIFADO', 14, 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text('REQUISIÇÃO OFICIAL DE MATERIAIS E SUPRIMENTOS', 14, 22);

  // Código da Requisição no canto superior direito
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(251, 191, 36); // #FBBF24
  doc.text(requisition.code, 196, 16, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Status: ${requisition.status}`, 196, 23, { align: 'right' });

  // Bloco de Dados da Requisição
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DA SOLICITAÇÃO', 14, 44);

  // Caixa de informações com borda suave
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 47, 182, 38, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('Setor Solicitante:', 18, 55);
  doc.text('Solicitante:', 18, 63);
  doc.text('Data de Emissão:', 18, 71);
  doc.text('Prioridade:', 18, 79);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(requisition.sectorName, 55, 55);
  doc.text(requisition.requesterName, 55, 63);
  doc.text(formatDateTime(requisition.date), 55, 71);

  // Prioridade com destaque
  doc.setFont('helvetica', 'bold');
  if (requisition.priority === 'URGENTE') {
    doc.setTextColor(220, 38, 38); // Red
  } else {
    doc.setTextColor(15, 23, 42);
  }
  doc.text(requisition.priority, 55, 79);

  // Coluna Direita do Bloco
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Atendido / Aprovado por:', 110, 55);
  doc.text('Data de Atendimento:', 110, 63);
  doc.text('Responsável Técnico:', 110, 71);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(requisition.approvedBy || 'Pendente de validação', 152, 55);
  doc.text(formatDateTime(requisition.dispatchedAt) || 'Em triagem', 152, 63);
  doc.text('Laura Taveira', 152, 71);

  // Tabela de Itens Requisitados
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('ITENS REQUISITADOS', 14, 94);

  const tableRows = requisition.items.map((it, idx) => [
    idx + 1,
    it.materialCode,
    it.materialName,
    it.unit,
    it.quantityRequested.toString(),
    formatCurrency(it.unitPrice),
    formatCurrency(it.totalPrice),
  ]);

  autoTable(doc, {
    startY: 97,
    head: [['Item', 'Código', 'Descrição do Material', 'UN', 'Qtd.', 'Preço Unit.', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 74 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    foot: [
      [
        { content: 'VALOR TOTAL ESTIMADO DA REQUISIÇÃO:', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(requisition.totalValue), styles: { halign: 'right', fontStyle: 'bold', textColor: [180, 83, 9] } },
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
    },
  });

  // Posição final após tabela
  let finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Bloco de Justificativa / Observações
  if (requisition.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('JUSTIFICATIVA / OBSERVAÇÕES:', 14, finalY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const splitNotes = doc.splitTextToSize(requisition.notes, 182);
    doc.text(splitNotes, 14, finalY + 13);
    finalY += 13 + splitNotes.length * 4;
  } else {
    finalY += 8;
  }

  // Bloco de Assinaturas (Conformidade Operacional do Almoxarifado)
  const signY = Math.max(finalY + 15, 220);

  doc.setDrawColor(148, 163, 184);
  doc.line(20, signY, 90, signY);
  doc.line(120, signY, 190, signY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Assinatura do Solicitante', 55, signY + 5, { align: 'center' });
  doc.text('Visto do Almoxarife / Responsável', 155, signY + 5, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(requisition.requesterName, 55, signY + 9, { align: 'center' });
  doc.text('Laura Taveira - Almoxarifado', 155, signY + 9, { align: 'center' });

  // Rodapé Técnico
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 280, 196, 280);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Documento gerado automaticamente pelo Sistema de Gestão de Estoque - Responsável Técnico: Laura Taveira`, 14, 285);
  doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')}`, 196, 285, { align: 'right' });

  // Download do arquivo
  doc.save(`Requisicao_${requisition.code}_${requisition.sectorName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * Gera e baixa o PDF do Relatório da Posição Atual do Estoque
 */
export function generateStockPositionPDF(
  materials: Material[],
  summary: {
    totalStockValue: number;
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  }
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Cabeçalho Azul Escuro
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 28, 'F');

  // Faixa amarela de acento
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 28, 297, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE GESTÃO DE ESTOQUE E ALMOXARIFADO', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text('RELATÓRIO OFICIAL DE POSIÇÃO ATUAL DE ESTOQUE E VALORAÇÃO PATRIMONIAL', 14, 20);

  doc.setFontSize(8.5);
  doc.setTextColor(251, 191, 36);
  doc.text(`Responsável Técnico: Laura Taveira`, 283, 13, { align: 'right' });
  doc.setTextColor(203, 213, 225);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 283, 20, { align: 'right' });

  // Resumo Gerencial (Cards no topo)
  const cardY = 36;
  const cardW = 63;
  const cardH = 18;

  // Card 1: Valor Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('VALOR TOTAL EM ESTOQUE', 18, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(summary.totalStockValue), 18, cardY + 13);

  // Card 2: Total de Itens Cadastrados
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(82, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('MATERIAIS CADASTRADOS', 86, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${summary.totalItems} itens`, 86, cardY + 13);

  // Card 3: Itens com Estoque Baixo
  doc.setFillColor(254, 243, 199); // Amber tint
  doc.roundedRect(150, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('ATENÇÃO: ESTOQUE BAIXO', 154, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text(`${summary.lowStockCount} itens`, 154, cardY + 13);

  // Card 4: Itens Zerados / Em Falta
  doc.setFillColor(254, 226, 226); // Red tint
  doc.roundedRect(218, cardY, cardW, cardH, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('CRÍTICO: ITENS EM FALTA', 222, cardY + 6);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(`${summary.outOfStockCount} itens zerados`, 222, cardY + 13);

  // Tabela de Posição de Estoque
  const tableRows = materials.map((m, idx) => {
    const totalVal = m.currentStock * m.unitPrice;
    let statusText = 'Normal';
    if (m.currentStock <= 0) {
      statusText = 'EM FALTA';
    } else if (m.currentStock <= m.minStock) {
      statusText = 'ESTOQUE BAIXO';
    }

    return [
      idx + 1,
      m.code,
      m.name,
      m.category,
      m.location || '-',
      m.unit,
      m.currentStock.toString(),
      m.minStock.toString(),
      formatCurrency(m.unitPrice),
      formatCurrency(totalVal),
      statusText,
      m.expirationDate ? formatDate(m.expirationDate) : '-',
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [
      [
        '#',
        'Código',
        'Material / Descrição',
        'Categoria',
        'Localização',
        'UN',
        'Qtd. Atual',
        'Mínimo',
        'Preço Unit.',
        'Valor Total',
        'Status',
        'Validade',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18, fontStyle: 'bold' },
      2: { cellWidth: 54 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24 },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 16, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
      10: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      11: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (data) => {
      // Destaque condicional de cores nas células de status
      if (data.section === 'body' && data.column.index === 10) {
        const val = data.cell.raw;
        if (val === 'EM FALTA') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fillColor = [254, 226, 226];
        } else if (val === 'ESTOQUE BAIXO') {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        } else {
          data.cell.styles.textColor = [22, 101, 52];
        }
      }
    },
    foot: [
      [
        { content: 'VALOR TOTAL CONSOLIDADO DO ESTOQUE:', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(summary.totalStockValue), colSpan: 3, styles: { halign: 'left', fontStyle: 'bold', textColor: [180, 83, 9] } },
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8.5,
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 198, 283, 198);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Sistema de Gestão de Estoque e Almoxarifado • Responsável Técnico: Laura Taveira`, 14, 203);
    doc.text(`Página ${i} de ${pageCount}`, 283, 203, { align: 'right' });
  }

  doc.save(`Posicao_Estoque_${new Date().toISOString().split('T')[0]}.pdf`);
}
