const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDeadlineReminder } = require('./emailService');

// Schedule to run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running deadline reminder check...');

  try {
    // Find tasks that are due in the next 24 hours or are overdue but not completed
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdueTasks = await Task.find({
      status: { $in: ['todo', 'in-progress'] },
      dueDate: { $lt: tomorrow },
      assignedTo: { $exists: true, $ne: [] }
    }).populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('client', 'name');

    console.log(`Found ${overdueTasks.length} tasks needing reminders`);

    // Send reminders for each task
    for (const task of overdueTasks) {
      if (task.assignedTo && task.assignedTo.length > 0) {
        await sendDeadlineReminder(task);
      }
    }

    console.log('Deadline reminders sent successfully');
  } catch (error) {
    console.error('Error in deadline reminder cron job:', error);
  }
});

// Schedule to run every hour to check for newly overdue tasks
cron.schedule('0 * * * *', async () => {
  console.log('Checking for newly overdue tasks...');

  try {
    // Find tasks that became overdue in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const now = new Date();

    const newlyOverdueTasks = await Task.find({
      status: { $in: ['todo', 'in-progress'] },
      dueDate: {
        $gte: oneHourAgo,
        $lt: now
      },
      assignedTo: { $exists: true, $ne: [] }
    }).populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('client', 'name');

    console.log(`Found ${newlyOverdueTasks.length} newly overdue tasks`);

    // Send reminders for newly overdue tasks
    for (const task of newlyOverdueTasks) {
      if (task.assignedTo && task.assignedTo.length > 0) {
        await sendDeadlineReminder(task);
      }
    }

    console.log('Newly overdue task reminders sent successfully');
  } catch (error) {
    console.error('Error in overdue check cron job:', error);
  }
});

module.exports = {
  startCronJobs: () => {
    console.log('Starting email cron jobs...');
    console.log('Daily deadline reminders: 9 AM daily');
    console.log('Hourly overdue checks: Every hour');
  }
};
