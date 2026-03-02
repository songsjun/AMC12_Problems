# 2008 AMC 12B Problem 2

> This problem is the same as [2008 AMC 12B #2](https://artofproblemsolving.com/wiki/index.php/2008_AMC_12B_Problems) and [2008 AMC 10B #2](https://artofproblemsolving.com/wiki/index.php/2008_AMC_10B_Problems/Problem_2).
## Problem
A $4\times 4$ block of calendar dates is shown. First, the order of the numbers in the second and the fourth rows are reversed. Then, the numbers on each diagonal are added. What will be the positive difference between the two diagonal sums?


$$
\begin{tabular}[t]{|c|c|c|c|} \multicolumn{4}{c}{}\\\hline 1&2&3&4\\\hline 8&9&10&11\\\hline 15&16&17&18\\\hline 22&23&24&25\\\hline \end{tabular}
$$


$\textbf{(A)}\ 2 \qquad \textbf{(B)}\ 4 \qquad \textbf{(C)}\ 6 \qquad \textbf{(D)}\ 8 \qquad \textbf{(E)}\ 10$
## Solution 1
After reversing the numbers on the second and fourth rows, the block will look like this:


$$
\begin{tabular}[t]{|c|c|c|c|} \multicolumn{4}{c}{}\\\hline 1&2&3&4\\\hline 11&10&9&8\\\hline 15&16&17&18\\\hline 25&24&23&22\\\hline \end{tabular}
$$


The positive difference between the two diagonal sums is then (4+9+16+25)-(1+10+17+22)=$3-1-1+3=\boxed{\textbf{(B) } 4}.$
## Solution 2
Notice that at baseline the diagonals sum to the same number (52).  Therefore we need only compute the effect of the swap.  The positive difference between 9 and 10 is 1 and the positive difference between 22 and 25 is 3. Adding gives $1+3=\boxed{\textbf{(B) } 4}$
## See Also
