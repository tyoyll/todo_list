import React, { useState } from 'react';
import statisticsService from '../../services/statisticsService';
import './ReportPage.scss';

type ReportType = 'TASK_SUMMARY' | 'TIME_SUMMARY' | 'COMPLETE';

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('COMPLETE');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.exportToExcel({
        reportType,
        startDate,
        endDate,
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `report_${reportType}_${startDate}_${endDate}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Excel 报表导出成功！');
    } catch (error: any) {
      console.error('导出失败:', error);
      alert(error.response?.data?.message || '导出 Excel 失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await statisticsService.exportToPDF({
        reportType,
        startDate,
        endDate,
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `report_${reportType}_${startDate}_${endDate}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('PDF 报表导出成功！');
    } catch (error: any) {
      console.error('导出失败:', error);
      alert(error.response?.data?.message || '导出 PDF 失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>报表导出</h1>
      </div>

      <div className="report-container">
        <div className="report-config">
          <h2>报表配置</h2>

          <div className="form-group">
            <label>报表类型</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              disabled={loading}
            >
              <option value="TASK_SUMMARY">任务摘要报表</option>
              <option value="TIME_SUMMARY">时间统计报表</option>
              <option value="COMPLETE">完整报表</option>
            </select>
            <p className="hint">
              {reportType === 'TASK_SUMMARY' && '包含任务统计、完成率、分类分布等信息'}
              {reportType === 'TIME_SUMMARY' && '包含工作时长、番茄钟记录等信息'}
              {reportType === 'COMPLETE' && '包含所有统计数据的完整报表'}
            </p>
          </div>

          <div className="form-group">
            <label>开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
            />
          </div>
        </div>

        <div className="report-preview">
          <h2>报表预览</h2>
          <div className="preview-content">
            <div className="preview-header">
              <h3>
                {reportType === 'TASK_SUMMARY' && '任务摘要报表'}
                {reportType === 'TIME_SUMMARY' && '时间统计报表'}
                {reportType === 'COMPLETE' && '完整报表'}
              </h3>
              <p>报表周期: {startDate} 至 {endDate}</p>
            </div>

            <div className="preview-sections">
              {(reportType === 'TASK_SUMMARY' || reportType === 'COMPLETE') && (
                <div className="preview-section">
                  <h4>📋 任务统计</h4>
                  <ul>
                    <li>总任务数</li>
                    <li>已完成任务</li>
                    <li>进行中任务</li>
                    <li>待处理任务</li>
                    <li>完成率</li>
                    <li>分类统计</li>
                    <li>优先级分布</li>
                  </ul>
                </div>
              )}

              {(reportType === 'TIME_SUMMARY' || reportType === 'COMPLETE') && (
                <div className="preview-section">
                  <h4>⏱️ 时间统计</h4>
                  <ul>
                    <li>总工作时长</li>
                    <li>完成的番茄钟数</li>
                    <li>平均每日工作时长</li>
                    <li>工作时间分布</li>
                    <li>时间记录明细</li>
                  </ul>
                </div>
              )}

              {reportType === 'COMPLETE' && (
                <div className="preview-section">
                  <h4>📊 效率分析</h4>
                  <ul>
                    <li>平均任务完成时间</li>
                    <li>日均任务量</li>
                    <li>最高效时段</li>
                    <li>效率趋势</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="export-actions">
          <h2>导出格式</h2>
          <div className="export-buttons">
            <button
              className="btn btn-excel"
              onClick={handleExportExcel}
              disabled={loading}
            >
              <span className="icon">📊</span>
              <span className="text">
                {loading ? '导出中...' : '导出为 Excel'}
              </span>
            </button>

            <button
              className="btn btn-pdf"
              onClick={handleExportPDF}
              disabled={loading}
            >
              <span className="icon">📄</span>
              <span className="text">
                {loading ? '导出中...' : '导出为 PDF'}
              </span>
            </button>
          </div>

          <div className="export-tips">
            <h4>💡 导出提示</h4>
            <ul>
              <li>Excel 格式适合进一步数据分析和编辑</li>
              <li>PDF 格式适合打印和分享</li>
              <li>导出的文件名包含报表类型和日期范围</li>
              <li>大量数据可能需要较长的导出时间，请耐心等待</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

