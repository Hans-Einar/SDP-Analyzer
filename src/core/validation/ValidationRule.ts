import type { ProjectSnapshot } from "../domain/ProjectSnapshot";
import type { Finding } from "../findings/Finding";
import type { AnalysisContext } from "./AnalysisContext";
export interface ValidationRule { readonly id: string; evaluate(snapshot: ProjectSnapshot, context: AnalysisContext): readonly Finding[]; }
