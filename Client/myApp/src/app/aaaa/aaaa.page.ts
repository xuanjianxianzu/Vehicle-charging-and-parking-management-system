import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-aaaa',
  templateUrl: './aaaa.page.html',
  styleUrls: ['./aaaa.page.scss'],
  standalone: false,
})
export class AaaaPage implements OnInit {

 public chart: any;
   public charts: { [key: string]: Chart } = {};
  ngOnInit() {
        this.createPieChart();
    this.createLineChart();
    this.createDoughnutChart();
  }
 
  createbarChart() {
    this.charts['barChart'] = new Chart('barChart', {
      type: 'bar', 
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
          label: 'Sales Data',
          data: [65, 59, 80, 81, 56],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, // 自适应容器大小
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


    // 饼图示例
  createPieChart() {
    this.charts['pieChart'] = new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['空闲', '占用', '预约'],
        datasets: [{
          data: [40, 30, 30], // 对应 parking_space_types 的数量
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
        }
      }
    });
  }
 
  // 折线图示例（订单量趋势）
  createLineChart() {
    this.charts['lineChart'] = new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['1点', '2点','3点','4点','5点','6点','7点','8点','9点','10点','11点','12点','13点','14点','15点','16点','17点','18点','19点','20点','21点','22点','23点','24点'],
        datasets: [{
          label: '每小时收入',
          data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          borderColor: '#4BC0C0',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
 
  // 环状图示例（用户角色分布）
  createDoughnutChart() {
    this.charts['doughnutChart'] = new Chart('doughnutChart', {
      type: 'doughnut',
      data: {
        labels: ['普通用户', 'VIP用户', '管理员'],
        datasets: [{
          data: [75, 20, 5], // 模拟数据
          backgroundColor: ['#4BC0C0', '#FFCD56', '#FF6384'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } }
      }
    });
  }


  updateChartData(newData: any[]) {
  this.charts['pieChart'].data.datasets[0].data = newData;
  this.charts['pieChart'].update(); // 触发重绘
}

}
