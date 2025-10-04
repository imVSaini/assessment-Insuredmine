import { Router } from 'express'

import { upload, uploadCSV } from '@controllers/upload.controller'

const router: Router = Router()

/**
 * @swagger
 * /upload/csv:
 *   post:
 *     summary: Upload CSV/XLSX file for data processing
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or XLSX file to upload
 *     responses:
 *       200:
 *         description: File uploaded and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: number
 *                     agentsCreated:
 *                       type: number
 *                     usersCreated:
 *                       type: number
 *                     accountsCreated:
 *                       type: number
 *                     categoriesCreated:
 *                       type: number
 *                     carriersCreated:
 *                       type: number
 *                     policiesCreated:
 *                       type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request - Invalid file type or missing file
 *       500:
 *         description: Internal server error
 */
// Upload CSV/XLSX file
router.post('/csv', upload.single('file'), uploadCSV)

export default router
