// import tasks
import { Task } from '../taskManager/Task';
import { attackTargetType, TaskAttack } from '../taskManager/TaskInstances/task_attack';
import { buildTargetType, TaskBuild } from '../taskManager/TaskInstances/task_build';
import { claimTargetType, TaskClaim } from '../taskManager/TaskInstances/task_claim';
import { dismantleTargetType, TaskDismantle } from '../taskManager/TaskInstances/task_dismantle';
import { fortifyTargetType, TaskFortify } from '../taskManager/TaskInstances/task_fortify';
import { getRenewedTargetType, TaskGetRenewed } from '../taskManager/TaskInstances/task_getRenewed';
import { goToTargetType, TaskGoTo } from '../taskManager/TaskInstances/task_goTo';
import { goToRoomTargetType, TaskGoToRoom } from '../taskManager/TaskInstances/task_goToRoom';
import { harvestTargetType, TaskHarvest } from '../taskManager/TaskInstances/task_harvest';
import { healTargetType, TaskHeal } from '../taskManager/TaskInstances/task_heal';
import { meleeAttackTargetType, TaskMeleeAttack } from '../taskManager/TaskInstances/task_meleeAttack';
import { pickupTargetType, TaskPickup } from '../taskManager/TaskInstances/task_pickup';
import { rangedAttackTargetType, TaskRangedAttack } from '../taskManager/TaskInstances/task_rangedAttack';
import { TaskWithdraw, withdrawTargetType } from '../taskManager/TaskInstances/task_withdraw';
import { repairTargetType, TaskRepair } from '../taskManager/TaskInstances/task_repair';
import { reserveTargetType, TaskReserve } from '../taskManager/TaskInstances/task_reserve';
import { signControllerTargetType, TaskSignController } from '../taskManager/TaskInstances/task_signController';
import { TaskTransfer, transferTargetType } from '../taskManager/TaskInstances/task_transfer';
import { TaskUpgrade, upgradeTargetType } from '../taskManager/TaskInstances/task_upgrade';
import { dropTargetType, TaskDrop } from '../taskManager/TaskInstances/task_drop';
import { deref, derefRoomPosition } from './helperFunctions';
import { TaskInvalid } from '../taskManager/TaskInstances/task_invalid';
import { TaskTransferAll } from '../taskManager/TaskInstances/task_transferAll';
import { TaskWithdrawAll, withdrawAllTargetType } from '../taskManager/TaskInstances/task_withdrawAll';


export function initializeTask(protoTask: protoTask): Task {
	// retrieve data from protoTask
	let taskName = protoTask.name // name should be build for TaskBuild
	let target = deref(protoTask._target.ref);
	let task: Task;

	// create a task object of the correct type
	switch (taskName) {
		case TaskAttack.taskName:
			task = new TaskAttack(target as attackTargetType);
			break;
		case TaskBuild.taskName:
			task = new TaskBuild(target as buildTargetType);
			break;
		case TaskClaim.taskName:
			task = new TaskClaim(target as claimTargetType);
			break;
		case TaskDismantle.taskName:
			task = new TaskDismantle(target as dismantleTargetType);
			break;
		case TaskDrop.taskName:
			task = new TaskDrop(derefRoomPosition(protoTask._target._pos) as dropTargetType);
			break;
		case TaskFortify.taskName:
			task = new TaskFortify(target as fortifyTargetType);
			break;
		case TaskGetRenewed.taskName:
			task = new TaskGetRenewed(target as getRenewedTargetType);
			break;
		case TaskGoTo.taskName:
			task = new TaskGoTo(derefRoomPosition(protoTask._target._pos) as goToTargetType);
			break;
		case TaskGoToRoom.taskName:
			task = new TaskGoToRoom(protoTask._target._pos.roomName as goToRoomTargetType);
			break;
		case TaskHarvest.taskName:
			task = new TaskHarvest(target as harvestTargetType);
			break;
		case TaskHeal.taskName:
			task = new TaskHeal(target as healTargetType);
			break;
		case TaskMeleeAttack.taskName:
			task = new TaskMeleeAttack(target as meleeAttackTargetType);
			break;
		case TaskPickup.taskName:
			task = new TaskPickup(target as pickupTargetType);
			break;
		case TaskRangedAttack.taskName:
			task = new TaskRangedAttack(target as rangedAttackTargetType);
			break;
		case TaskRepair.taskName:
			task = new TaskRepair(target as repairTargetType);
			break;
		case TaskReserve.taskName:
			task = new TaskReserve(target as reserveTargetType);
			break;
		case TaskSignController.taskName:
			task = new TaskSignController(target as signControllerTargetType);
			break;
		case TaskTransfer.taskName:
			task = new TaskTransfer(target as transferTargetType);
			break;
		case TaskTransferAll.taskName:
			task = new TaskTransferAll(target as transferAllTargetType);
			break;
		case TaskUpgrade.taskName:
			task = new TaskUpgrade(target as upgradeTargetType);
			break;
		case TaskWithdraw.taskName:
			task = new TaskWithdraw(target as withdrawTargetType);
			break;
		case TaskWithdrawAll.taskName:
			task = new TaskWithdrawAll(target as withdrawAllTargetType);
			break;
		default:
			console.log(`Invalid task name: ${taskName}! task.creep: ${protoTask._creep.name}. Deleting from memory!`);
			task = new TaskInvalid(target as any);
			break;
	}
	// Set the task proto to what is in memory
	task.proto = protoTask;
	// Return it
	return task;
}