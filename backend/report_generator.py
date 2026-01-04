from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.barcharts import VerticalBarChart
from datetime import datetime
import os

def create_bar_chart(data, labels, title):
    drawing = Drawing(400, 200)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 50
    chart.height = 125
    chart.width = 300
    chart.data = [data]
    chart.categoryAxis.categoryNames = labels
    chart.bars[0].fillColor = colors.HexColor('#3B82F6')
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(data) * 1.2
    drawing.add(chart)
    return drawing

def generate_sustainability_report(city_snapshot, alerts, ai_analysis=None, output_path='reports'):
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = os.path.join(output_path, f'sustainability_report_{timestamp}.pdf')
    
    doc = SimpleDocTemplate(filename, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1E40AF')
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=14
    )
    
    elements = []
    
    elements.append(Paragraph('Smart City Sustainability Report', title_style))
    elements.append(Paragraph(f'Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', styles['Normal']))
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph('City Overview', heading_style))
    
    summary = city_snapshot.get('summary', {})
    overview_data = [
        ['Metric', 'Current Value', 'Status'],
        ['Average Traffic Density', f'{summary.get("avg_traffic", 0):.1f}%', 'Normal' if summary.get('avg_traffic', 0) < 80 else 'High'],
        ['Average Air Quality Index', f'{summary.get("avg_aqi", 0):.1f}', 'Good' if summary.get('avg_aqi', 0) < 100 else 'Poor'],
        ['Average Noise Level', f'{summary.get("avg_noise", 0):.1f} dB', 'Normal' if summary.get('avg_noise', 0) < 75 else 'High'],
        ['Total Electricity Usage', f'{summary.get("total_electricity", 0):.1f} MW', 'Optimal'],
        ['Total Water Usage', f'{summary.get("total_water", 0):.1f} ML', 'Optimal'],
    ]
    
    overview_table = Table(overview_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(overview_table)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph('Zone Performance Analysis', heading_style))
    
    zones = city_snapshot.get('zones', [])
    if zones:
        zone_data = [['Zone', 'Traffic', 'AQI', 'Noise', 'Power', 'Water']]
        for zone in zones:
            zone_data.append([
                zone.get('zone_name', 'N/A'),
                f'{zone.get("traffic_density", 0):.1f}%',
                f'{zone.get("air_quality", 0):.1f}',
                f'{zone.get("noise_level", 0):.1f}',
                f'{zone.get("electricity", 0):.1f}%',
                f'{zone.get("water_usage", 0):.1f}%',
            ])
        
        zone_table = Table(zone_data, colWidths=[1.2*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch])
        zone_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
        ]))
        elements.append(zone_table)
    
    elements.append(Spacer(1, 20))
    
    active_alerts = [a for a in alerts if not a.get('resolved', True)]
    if active_alerts:
        elements.append(Paragraph('Active Alerts & Problems Detected', heading_style))
        
        for alert in active_alerts[:10]:
            severity_color = '#EF4444' if alert.get('severity') == 'critical' else '#F59E0B'
            alert_text = f'<font color="{severity_color}">●</font> <b>{alert.get("zone_name", "Unknown")}</b>: {alert.get("message", "No message")}'
            elements.append(Paragraph(alert_text, body_style))
        
        elements.append(Spacer(1, 10))
    
    elements.append(Paragraph('Optimization Recommendations', heading_style))
    
    if ai_analysis:
        elements.append(Paragraph(ai_analysis, body_style))
    else:
        recommendations = [
            'Implement smart traffic light systems to reduce congestion in high-traffic zones.',
            'Deploy additional air quality sensors and green spaces in industrial areas.',
            'Consider noise barriers and quiet zones in residential districts.',
            'Optimize power grid distribution during peak hours.',
            'Implement rainwater harvesting systems to reduce water consumption.',
        ]
        for rec in recommendations:
            elements.append(Paragraph(f'• {rec}', body_style))
    
    elements.append(Spacer(1, 30))
    elements.append(Paragraph('Report generated by Smart City Digital Twin Platform', 
                             ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, textColor=colors.gray, alignment=1)))
    
    doc.build(elements)
    return filename
