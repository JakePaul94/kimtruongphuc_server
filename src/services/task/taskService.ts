// src/services/tasks/taskService.ts

import { Op, WhereOptions } from 'sequelize';
import { models } from '../../config/database';
import {
    TaskAttributes,
    TaskInstance,
    TaskCreationAttributes
} from '../../models/tasks/taskModel';
import { ApiError } from '../../utils/ApiError';
// import { userService } from '../userService';
// import { deviceService } from '../devices/deviceService';

const { Task, User, Device, MaintenanceRecord, InspectionRecord } = models;

const createTask = async (taskData: TaskCreationAttributes): Promise<TaskInstance> => {
    try {
        const newTask = await Task.create(taskData);
        return newTask.reload({
             include: [
                 { model: User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
             ]
         });
    } catch (error: any) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new ApiError(400, `Invalid input: ${error.message}`);
        }
        console.error("Error creating task:", error);
        throw new ApiError(500, 'Failed to create task');
    }
};

const getTaskById = async (id: number, includeOptions?: object): Promise<TaskInstance | null> => {
    if (isNaN(id)) {
        throw new ApiError(400, 'Invalid Task ID');
    }
    const defaultIncludes = [
        { model: User, as: 'requester', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] },
        { model: Device, as: 'device', attributes: ['id', 'deviceCode', 'deviceName'] },
        { model: MaintenanceRecord, as: 'maintenanceRecord'},
        { model: InspectionRecord, as: 'inspectionRecord'}
    ];

    const options = includeOptions ? { ...includeOptions, include: [...defaultIncludes, ...(includeOptions as any).include || []] } : { include: defaultIncludes };

    const task = await Task.findByPk(id, options);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }
    return task;
};

const updateTask = async (id: number, updateData: Partial<Omit<TaskAttributes, 'id' | 'requesterUserId' | 'assignedUserId' | 'assignedGroupId' | 'status' | 'completedAt' | 'relatedMaintenanceRecordId' | 'relatedInspectionRecordId' | 'createdAt' | 'updatedAt'>>): Promise<TaskInstance> => {
     if (isNaN(id)) {
        throw new ApiError(400, 'Invalid Task ID');
    }
    const task = await Task.findByPk(id);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    const allowedUpdates: Partial<TaskAttributes> = {};
     const allowedKeys: Array<keyof typeof updateData> = ['title', 'description', 'taskType', 'priority', 'deviceId', 'dueDate', 'beforeImagePath', 'afterImagePath'];

     allowedKeys.forEach(key => {
         if (updateData[key] !== undefined) {
             (allowedUpdates as any)[key] = updateData[key];
         }
     });

     if (Object.keys(allowedUpdates).length === 0) {
          throw new ApiError(400, 'No valid fields provided for update.');
     }

    try {
        await task.update(allowedUpdates);
        return task.reload({
             include: [
                { model: User, as: 'requester', attributes: ['id', 'username', 'fullName'] },
                { model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] },
                { model: Device, as: 'device', attributes: ['id', 'deviceCode', 'deviceName'] },
             ]
         });
    } catch (error: any) {
         if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new ApiError(400, `Invalid input: ${error.message}`);
        }
        console.error(`Error updating task ${id}:`, error);
        throw new ApiError(500, `Failed to update task ${id}`);
    }
};

const assignTaskToUser = async (taskId: number, userId: number | null): Promise<TaskInstance> => {
     if (isNaN(taskId)) throw new ApiError(400, 'Invalid Task ID');
     if (userId !== null && isNaN(userId)) throw new ApiError(400, 'Invalid User ID');

    const task = await Task.findByPk(taskId);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    const updatePayload: Partial<TaskAttributes> = {
        assignedUserId: userId,
    };
     if (userId !== null && task.status === 'PENDING') {
         updatePayload.status = 'ASSIGNED';
     } else if (userId === null && task.status === 'ASSIGNED') {
        updatePayload.status = 'PENDING';
     }

    try {
        await task.update(updatePayload);
        return task.reload({include: [{ model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] }]});
    } catch (error) {
        console.error(`Error assigning task ${taskId} to user ${userId}:`, error);
        throw new ApiError(500, 'Failed to assign task');
    }
};

const changeTaskStatus = async (taskId: number, newStatus: string): Promise<TaskInstance> => {
     if (isNaN(taskId)) throw new ApiError(400, 'Invalid Task ID');

    const task = await Task.findByPk(taskId);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    const currentStatus = task.status;
    const allowedTransitions: { [key: string]: string[] } = {
        PENDING: ['ASSIGNED', 'CANCELLED'],
        ASSIGNED: ['IN_PROGRESS', 'CANCELLED', 'PENDING'],
        IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
        ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
    };

    if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
        throw new ApiError(400, `Cannot transition task status from '${currentStatus}' to '${newStatus}'.`);
    }

     if (newStatus === 'COMPLETED') {
         throw new ApiError(400, "Use completeTask function to mark task as completed.");
     }

    try {
        await task.update({ status: newStatus });
        return task.reload();
    } catch (error) {
        console.error(`Error changing task ${taskId} status to ${newStatus}:`, error);
        throw new ApiError(500, 'Failed to change task status');
    }
};


const completeTask = async (taskId: number, completionData: {
    completedAt?: Date;
    notes?: string;
    afterImagePath?: string | null;
    relatedRecordId?: number;
    recordType?: 'maintenance' | 'inspection';
}): Promise<TaskInstance> => {
    if (isNaN(taskId)) throw new ApiError(400, 'Invalid Task ID');

    const task = await Task.findByPk(taskId);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

     if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
          throw new ApiError(400, `Task is already in status '${task.status}'.`);
     }

    const updatePayload: Partial<TaskAttributes> = {
        status: 'COMPLETED',
        completedAt: completionData.completedAt || new Date(),
        afterImagePath: completionData.afterImagePath
    };

     if (completionData.relatedRecordId && completionData.recordType) {
         if (completionData.recordType === 'maintenance') {
             updatePayload.relatedMaintenanceRecordId = completionData.relatedRecordId;
         } else if (completionData.recordType === 'inspection') {
             updatePayload.relatedInspectionRecordId = completionData.relatedRecordId;
         } else {
             console.warn(`Invalid recordType '${completionData.recordType}' provided for task completion.`);
         }
     }

    try {
        await task.update(updatePayload);
         return task.reload({
             include: [
                 { model: MaintenanceRecord, as: 'maintenanceRecord'},
                 { model: InspectionRecord, as: 'inspectionRecord'}
             ]
         });
    } catch (error) {
         console.error(`Error completing task ${taskId}:`, error);
        throw new ApiError(500, 'Failed to complete task');
    }

};

const deleteTask = async (id: number): Promise<void> => {
    if (isNaN(id)) {
        throw new ApiError(400, 'Invalid Task ID');
    }
    const task = await Task.findByPk(id);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    try {
        await task.destroy();
    } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
        throw new ApiError(500, `Failed to delete task ${id}`);
    }
};


export const taskService = {
    createTask,
    getTaskById,
    updateTask,
    assignTaskToUser,
    // assignTaskToGroup,
    changeTaskStatus,
    completeTask,
    deleteTask,
};