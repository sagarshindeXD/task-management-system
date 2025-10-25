const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Task Management System" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}: ${options.subject}`);
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  taskAssigned: (task, assignee, assigner) => ({
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3f51b5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Task Assigned</h1>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello ${assignee.name},</p>
          <p>You have been assigned a new task by <strong>${assigner.name}</strong>.</p>

          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3f51b5;">
            <h3 style="margin: 0 0 10px 0; color: #3f51b5;">${task.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong>
              <span style="padding: 2px 8px; border-radius: 4px; margin-left: 5px; font-weight: bold; font-size: 12px;
                ${task.priority === 'high' ? 'background-color: #f44336; color: white;' :
                  task.priority === 'medium' ? 'background-color: #ff9800; color: white;' :
                  'background-color: #4caf50; color: white;'}">
                ${task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </p>
            ${task.dueDate ? `<p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
            <p style="margin: 5px 0; color: #666;"><strong>Client:</strong> ${typeof task.client === 'object' ? task.client.name : task.client || 'N/A'}</p>
          </div>

          <p>Please log in to your account to view the full task details and update its status.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}"
               style="background-color: #3f51b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Task Details
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message from the Task Management System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
      New Task Assigned: ${task.title}

      Hello ${assignee.name},

      You have been assigned a new task by ${assigner.name}.

      Task Details:
      - Title: ${task.title}
      - Description: ${task.description || 'No description provided'}
      - Priority: ${task.priority?.toUpperCase() || 'MEDIUM'}
      ${task.dueDate ? `- Due Date: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
      - Client: ${typeof task.client === 'object' ? task.client.name : task.client || 'N/A'}

      Please log in to your account to view the full task details and update its status.

      View Task: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}

      This is an automated message from the Task Management System.
    `,
  }),

  taskUpdated: (task, assignee, updater) => ({
    subject: `Task Updated: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #3f51b5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Task Updated</h1>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello ${assignee.name},</p>
          <p>A task assigned to you has been updated by <strong>${updater.name}</strong>.</p>

          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3f51b5;">
            <h3 style="margin: 0 0 10px 0; color: #3f51b5;">${task.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> ${task.status}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong>
              <span style="padding: 2px 8px; border-radius: 4px; margin-left: 5px; font-weight: bold; font-size: 12px;
                ${task.priority === 'high' ? 'background-color: #f44336; color: white;' :
                  task.priority === 'medium' ? 'background-color: #ff9800; color: white;' :
                  'background-color: #4caf50; color: white;'}">
                ${task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </p>
            ${task.dueDate ? `<p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}"
               style="background-color: #3f51b5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Updated Task
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message from the Task Management System.
          </p>
        </div>
      </div>
    `,
  }),

  taskCompleted: (task, assignee, completer) => ({
    subject: `Task Completed: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4caf50; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Task Completed!</h1>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello ${assignee.name},</p>
          <p>Great news! The task <strong>"${task.title}"</strong> has been completed by <strong>${completer.name}</strong>.</p>

          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin: 0 0 10px 0; color: #4caf50;">${task.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Completed ✅</p>
            <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong>
              <span style="padding: 2px 8px; border-radius: 4px; margin-left: 5px; font-weight: bold; font-size: 12px;
                ${task.priority === 'high' ? 'background-color: #f44336; color: white;' :
                  task.priority === 'medium' ? 'background-color: #ff9800; color: white;' :
                  'background-color: #4caf50; color: white;'}">
                ${task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </p>
            ${task.dueDate ? `<p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}"
               style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Completed Task
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated message from the Task Management System.
          </p>
        </div>
      </div>
    `,
  }),

  deadlineReminder: (task, assignee) => ({
    subject: `⚠️ Task Deadline Approaching: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ff9800; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Deadline Reminder</h1>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello ${assignee.name},</p>
          <p>This is a friendly reminder that you have an upcoming task deadline.</p>

          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin: 0 0 10px 0; color: #ff9800;">${task.title}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> ${task.status}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong>
              <span style="padding: 2px 8px; border-radius: 4px; margin-left: 5px; font-weight: bold; font-size: 12px;
                ${task.priority === 'high' ? 'background-color: #f44336; color: white;' :
                  task.priority === 'medium' ? 'background-color: #ff9800; color: white;' :
                  'background-color: #4caf50; color: white;'}">
                ${task.priority?.toUpperCase() || 'MEDIUM'}
              </span>
            </p>
            <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong>
              <span style="color: #ff9800; font-weight: bold;">${new Date(task.dueDate).toLocaleDateString()}</span>
            </p>
            ${new Date(task.dueDate) < new Date() ?
              '<p style="margin: 5px 0; color: #f44336; font-weight: bold;">⚠️ This task is overdue!</p>' :
              `<p style="margin: 5px 0; color: #666;"><strong>Days remaining:</strong> ${Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}</p>`
            }
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${task._id}"
               style="background-color: #ff9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update Task Status
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated reminder from the Task Management System.
          </p>
        </div>
      </div>
    `,
  }),
};

// Email service functions
const sendTaskAssignedEmail = async (task, assigneeIds) => {
  try {
    // Send email to all assignees
    for (const assigneeId of assigneeIds) {
      const assignee = await User.findById(assigneeId);
      const assigner = await User.findById(task.createdBy);

      if (!assignee || !assigner) {
        console.log('Assignee or assigner not found for email notification');
        continue;
      }

      if (!assignee.email) {
        console.log('Assignee has no email address');
        continue;
      }

      const emailData = emailTemplates.taskAssigned(task, assignee, assigner);
      await sendEmail({
        email: assignee.email,
        ...emailData,
      });
    }
  } catch (error) {
    console.error('Failed to send task assigned emails:', error);
  }
};

const sendTaskUpdatedEmail = async (task, assigneeIds, updaterId) => {
  try {
    const updater = await User.findById(updaterId);
    if (!updater) {
      console.log('Updater not found for email notification');
      return;
    }

    // Send email to all assignees
    for (const assigneeId of assigneeIds) {
      const assignee = await User.findById(assigneeId);
      if (assignee && assignee.email) {
        const emailData = emailTemplates.taskUpdated(task, assignee, updater);
        await sendEmail({
          email: assignee.email,
          ...emailData,
        });
      }
    }
  } catch (error) {
    console.error('Failed to send task updated emails:', error);
  }
};

const sendTaskCompletedEmail = async (task, assigneeIds, completerId) => {
  try {
    const completer = await User.findById(completerId);
    if (!completer) {
      console.log('Completer not found for email notification');
      return;
    }

    // Send email to all assignees and the creator
    const recipients = [...assigneeIds, task.createdBy];
    const uniqueRecipients = [...new Set(recipients)];

    for (const recipientId of uniqueRecipients) {
      const recipient = await User.findById(recipientId);
      if (recipient && recipient.email) {
        const emailData = emailTemplates.taskCompleted(task, recipient, completer);
        await sendEmail({
          email: recipient.email,
          ...emailData,
        });
      }
    }
  } catch (error) {
    console.error('Failed to send task completed emails:', error);
  }
};

const sendDeadlineReminder = async (task) => {
  try {
    // Send reminder to all assignees
    for (const assigneeId of task.assignedTo) {
      const assignee = await User.findById(assigneeId);
      if (assignee && assignee.email) {
        const emailData = emailTemplates.deadlineReminder(task, assignee);
        await sendEmail({
          email: assignee.email,
          ...emailData,
        });
      }
    }
  } catch (error) {
    console.error('Failed to send deadline reminder:', error);
  }
};

module.exports = {
  sendEmail,
  sendTaskAssignedEmail,
  sendTaskUpdatedEmail,
  sendTaskCompletedEmail,
  sendDeadlineReminder,
  emailTemplates,
};
