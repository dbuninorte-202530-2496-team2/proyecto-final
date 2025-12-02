import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { AsistenciaTutorReporte, NotasTutorReporte } from './entities';
import { FiltroFechasDto } from './dto';

@Injectable()
export class PdfService {
    /**
     * Generate PDF for Asistencia Tutor report
     */
    async generateAsistenciaTutorPDF(
        data: AsistenciaTutorReporte[],
        tutorNombre: string,
        filtros?: FiltroFechasDto
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });

                const buffers: Buffer[] = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                // Header
                this.addHeader(doc, 'REPORTE DE ASISTENCIA DEL TUTOR', tutorNombre);

                // Date range if filters applied
                if (filtros?.fecha_inicio || filtros?.fecha_fin) {
                    doc.fontSize(9)
                        .fillColor('#666666')
                        .text(
                            `Periodo: ${filtros.fecha_inicio || 'Inicio'} - ${filtros.fecha_fin || 'Presente'}`,
                            50,
                            doc.y,
                            { align: 'left' }
                        );
                    doc.moveDown(0.5);
                }

                doc.moveDown();

                if (data.length === 0) {
                    doc.fontSize(11)
                        .fillColor('#999999')
                        .text('No se encontraron registros de clases en este periodo.', {
                            align: 'center',
                        });
                } else {
                    // Table header
                    const tableTop = doc.y;
                    const colWidths = {
                        fecha: 70,
                        horario: 80,
                        aula: 120,
                        estado: 65,
                        observaciones: 177,
                    };

                    this.drawTableHeader(
                        doc,
                        tableTop,
                        [
                            { text: 'Fecha', width: colWidths.fecha },
                            { text: 'Horario', width: colWidths.horario },
                            { text: 'Aula/Sede/Inst.', width: colWidths.aula },
                            { text: 'Estado', width: colWidths.estado },
                            { text: 'Observaciones', width: colWidths.observaciones },
                        ]
                    );

                    // Table rows
                    let y = tableTop + 25;
                    data.forEach((asistencia, index) => {
                        // Check if we need a new page
                        if (y > 700) {
                            doc.addPage();
                            y = 50;
                            this.drawTableHeader(doc, y, [
                                { text: 'Fecha', width: colWidths.fecha },
                                { text: 'Horario', width: colWidths.horario },
                                { text: 'Aula/Sede/Inst.', width: colWidths.aula },
                                { text: 'Estado', width: colWidths.estado },
                                { text: 'Observaciones', width: colWidths.observaciones },
                            ]);
                            y += 25;
                        }

                        const rowHeight = this.drawAsistenciaRow(
                            doc,
                            y,
                            asistencia,
                            colWidths,
                            index % 2 === 0
                        );
                        y += rowHeight;
                    });

                    // Summary stats
                    doc.moveDown(2);
                    const dictadas = data.filter(a => a.estado === 'DICTADA').length;
                    const noDictadas = data.filter(a => a.estado === 'NO_DICTADA').length;
                    const repuestas = data.filter(a => a.estado === 'REPUESTA').length;
                    const pendientes = data.filter(a => a.estado === 'PENDIENTE').length;
                    const total = data.length;

                    doc.fontSize(10)
                        .fillColor('#000000')
                        .font('Helvetica-Bold')
                        .text('RESUMEN:', 50, doc.y);

                    doc.font('Helvetica')
                        .fontSize(9)
                        .text(`Total de clases programadas: ${total}`, 50, doc.y + 5)
                        .text(`Clases dictadas: ${dictadas}`, 50, doc.y + 5)
                        .text(`Clases no dictadas: ${noDictadas}`, 50, doc.y + 5)
                        .text(`Clases repuestas: ${repuestas}`, 50, doc.y + 5)
                        .text(`Clases pendientes: ${pendientes}`, 50, doc.y + 5)
                        .text(`Cumplimiento: ${total > 0 ? Math.round(((dictadas + repuestas) / total) * 100) : 0}%`, 50, doc.y + 5);
                }

                // Footer
                this.addFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate PDF for Notas Tutor report
     */
    async generateNotasTutorPDF(
        data: NotasTutorReporte[],
        tutorNombre: string
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'LETTER',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });

                const buffers: Buffer[] = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', reject);

                // Header
                this.addHeader(doc, 'REPORTE DE CALIFICACIONES REGISTRADAS', tutorNombre);
                doc.moveDown();

                if (data.length === 0) {
                    doc.fontSize(11)
                        .fillColor('#999999')
                        .text('No se encontraron registros de notas.', {
                            align: 'center',
                        });
                } else {
                    // Table header
                    const tableTop = doc.y;
                    const colWidths = {
                        estudiante: 110,
                        aula: 95,
                        componente: 100,
                        nota: 45,
                        comentario: 162,
                    };

                    this.drawTableHeader(
                        doc,
                        tableTop,
                        [
                            { text: 'Estudiante', width: colWidths.estudiante },
                            { text: 'Aula / Sede / Institución', width: colWidths.aula },
                            { text: 'Componente / Periodo', width: colWidths.componente },
                            { text: 'Nota', width: colWidths.nota },
                            { text: 'Comentario', width: colWidths.comentario },
                        ]
                    );

                    // Table rows
                    let y = tableTop + 25;
                    data.forEach((nota, index) => {
                        // Check if we need a new page
                        if (y > 700) {
                            doc.addPage();
                            y = 50;
                            this.drawTableHeader(doc, y, [
                                { text: 'Estudiante', width: colWidths.estudiante },
                                { text: 'Aula / Sede / Institución', width: colWidths.aula },
                                { text: 'Componente / Periodo', width: colWidths.componente },
                                { text: 'Nota', width: colWidths.nota },
                                { text: 'Comentario', width: colWidths.comentario },
                            ]);
                            y += 25;
                        }

                        const rowHeight = this.drawNotaRow(
                            doc,
                            y,
                            nota,
                            colWidths,
                            index % 2 === 0
                        );
                        y += rowHeight;
                    });

                    // Summary stats - simplified for log-style report
                    doc.moveDown(2);
                    const totalNotas = data.length;

                    doc.fontSize(10)
                        .fillColor('#000000')
                        .font('Helvetica-Bold')
                        .text('RESUMEN:', 50, doc.y);

                    doc.font('Helvetica')
                        .fontSize(9)
                        .text(`Total de notas registradas: ${totalNotas}`, 50, doc.y + 5);
                }

                // Footer
                this.addFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    // ===== HELPER METHODS =====

    private addHeader(doc: PDFKit.PDFDocument, title: string, tutorNombre: string) {
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#1e40af')
            .text(title, 50, 50, { align: 'center' });

        doc.fontSize(11)
            .font('Helvetica')
            .fillColor('#374151')
            .text(`Tutor: ${tutorNombre}`, 50, 75, { align: 'center' });

        doc.fontSize(9)
            .fillColor('#6b7280')
            .text(
                `Generado el: ${new Date().toLocaleString('es-CO', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                50,
                90,
                { align: 'center' }
            );

        // Draw line separator
        doc.moveTo(50, 105)
            .lineTo(562, 105)
            .strokeColor('#e5e7eb')
            .stroke();

        doc.moveDown(2);
    }

    private addFooter(doc: PDFKit.PDFDocument) {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
                .fillColor('#9ca3af')
                .text(
                    `Página ${i + 1} de ${pages.count}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
        }
    }

    private drawTableHeader(
        doc: PDFKit.PDFDocument,
        y: number,
        columns: { text: string; width: number }[]
    ) {
        let x = 50;

        // Draw header background
        doc.rect(50, y, 512, 20)
            .fillColor('#f3f4f6')
            .fill();

        // Draw header text
        columns.forEach(col => {
            doc.fontSize(8)
                .font('Helvetica-Bold')
                .fillColor('#374151')
                .text(col.text, x + 5, y + 6, {
                    width: col.width - 10,
                    align: 'left',
                });
            x += col.width;
        });

        // Draw bottom border
        doc.moveTo(50, y + 20)
            .lineTo(562, y + 20)
            .strokeColor('#d1d5db')
            .stroke();
    }

    private drawAsistenciaRow(
        doc: PDFKit.PDFDocument,
        y: number,
        asistencia: AsistenciaTutorReporte,
        colWidths: any,
        isEven: boolean
    ): number {
        // Alternating row background
        if (isEven) {
            doc.rect(50, y, 512, 20).fillColor('#fafafa').fill();
        }

        let x = 50;
        const padding = 5;
        const fontSize = 8;

        // Fecha
        doc.fontSize(fontSize)
            .font('Helvetica')
            .fillColor('#000000')
            .text(this.formatDate(asistencia.fecha_real), x + padding, y + 6, {
                width: colWidths.fecha - 10,
                align: 'left',
            });
        x += colWidths.fecha;

        // Horario (día + horas)
        const dia = asistencia.dia_semana.substring(0, 2).toUpperCase();
        doc.text(
            `${dia} ${this.formatTime(asistencia.hora_inicio)}-${this.formatTime(asistencia.hora_fin)}`,
            x + padding,
            y + 6,
            { width: colWidths.horario - 10, align: 'left' }
        );
        x += colWidths.horario;

        // Aula/Sede/Institución
        const aulaText = `${asistencia.aula_grado}°${asistencia.aula_grupo}\n${asistencia.sede_nombre}`;
        doc.fontSize(7)
            .text(aulaText, x + padding, y + 4, {
                width: colWidths.aula - 10,
                align: 'left',
            });
        x += colWidths.aula;

        // Estado
        const estado = this.getEstadoText(asistencia);
        doc.fontSize(fontSize)
            .fillColor(this.getEstadoColor(asistencia))
            .font('Helvetica-Bold')
            .text(estado, x + padding, y + 6, {
                width: colWidths.estado - 10,
                align: 'left',
            });
        x += colWidths.estado;

        // Observaciones
        let observaciones = '';
        if (asistencia.motivo_descripcion) {
            observaciones = `${asistencia.motivo_descripcion}`;
        }
        if (asistencia.fecha_reposicion) {
            if (observaciones) observaciones += '\n';
            observaciones += `Repuesta: ${this.formatDate(asistencia.fecha_reposicion)}`;
        }
        if (!observaciones) observaciones = '-';

        doc.fontSize(7)
            .fillColor('#374151')
            .font('Helvetica')
            .text(observaciones, x + padding, y + 4, {
                width: colWidths.observaciones - 10,
                align: 'left',
            });

        // Draw row border
        doc.moveTo(50, y + 20)
            .lineTo(562, y + 20)
            .strokeColor('#e5e7eb')
            .stroke();

        return 20;
    }

    private drawNotaRow(
        doc: PDFKit.PDFDocument,
        y: number,
        nota: NotasTutorReporte,
        colWidths: any,
        isEven: boolean
    ): number {
        // Alternating row background
        if (isEven) {
            doc.rect(50, y, 512, 20).fillColor('#fafafa').fill();
        }

        let x = 50;
        const padding = 5;
        const fontSize = 8;

        // Estudiante
        doc.fontSize(fontSize)
            .font('Helvetica')
            .fillColor('#000000')
            .text(nota.estudiante_nombre, x + padding, y + 6, {
                width: colWidths.estudiante - 10,
                align: 'left',
            });
        x += colWidths.estudiante;

        // Aula/Sede/Institución
        const aulaText = `${nota.aula_grado}°${nota.aula_grupo}\n${nota.sede_nombre}`;
        doc.fontSize(7)
            .text(aulaText, x + padding, y + 4, {
                width: colWidths.aula - 10,
                align: 'left',
            });
        x += colWidths.aula;

        // Componente/Periodo
        const componenteText = `${nota.componente_nombre}\n${nota.periodo_anho}-P${nota.periodo_numero}`;
        doc.fontSize(7)
            .text(componenteText, x + padding, y + 4, {
                width: colWidths.componente - 10,
                align: 'left',
            });
        x += colWidths.componente;

        // Nota
        doc.fontSize(fontSize)
            .font('Helvetica-Bold')
            .fillColor(nota.valor_nota < 70 ? '#dc2626' : '#16a34a')
            .text(nota.valor_nota.toString(), x + padding, y + 6, {
                width: colWidths.nota - 10,
                align: 'center',
            });
        x += colWidths.nota;

        // Comentario
        doc.fontSize(7)
            .fillColor('#374151')
            .font('Helvetica')
            .text(nota.comentario || '-', x + padding, y + 6, {
                width: colWidths.comentario - 10,
                align: 'left',
            });

        // Draw row border
        doc.moveTo(50, y + 20)
            .lineTo(562, y + 20)
            .strokeColor('#e5e7eb')
            .stroke();

        return 20;
    }

    private formatDate(dateStr: string | Date): string {
        if (!dateStr) return '-';

        // Handle Date objects
        if (dateStr instanceof Date) {
            return dateStr.toISOString().split('T')[0];
        }

        // Handle string dates
        if (typeof dateStr === 'string') {
            return dateStr.split('T')[0]; // YYYY-MM-DD
        }

        return '-';
    }

    private formatTime(timeStr: string): string {
        if (!timeStr) return '';

        // If it's already in HH:mm format
        if (typeof timeStr === 'string' && timeStr.length <= 8) {
            return timeStr.substring(0, 5); // HH:mm
        }

        return timeStr;
    }

    private getEstadoText(asistencia: AsistenciaTutorReporte): string {
        // Use estado field from database if available
        if (asistencia.estado) {
            return asistencia.estado === 'NO_DICTADA' ? 'NO DICTADA' : asistencia.estado;
        }

        // Fallback logic for backward compatibility
        // IMPORTANT: Check for null/undefined dicto_clase first (means PENDIENTE)
        if (asistencia.dicto_clase === null || asistencia.dicto_clase === undefined) {
            return 'PENDIENTE';
        } else if (asistencia.dicto_clase === true) {
            return 'DICTADA';
        } else if (asistencia.fecha_reposicion) {
            return 'REPUESTA';
        } else {
            return 'NO DICTADA';
        }
    }

    private getEstadoColor(asistencia: AsistenciaTutorReporte): string {
        // Use estado field from database if available
        const estado = asistencia.estado || '';

        if (estado === 'DICTADA' || asistencia.dicto_clase) {
            return '#16a34a'; // green
        } else if (estado === 'REPUESTA' || asistencia.fecha_reposicion) {
            return '#2563eb'; // blue
        } else if (estado === 'PENDIENTE') {
            return '#f59e0b'; // amber/orange for pending
        } else {
            return '#dc2626'; // red for no dictada
        }
    }
}
