# 2005 AMC 12B Problem 10

> This problem is the same as [2005 AMC 12B #10](https://artofproblemsolving.com/wiki/index.php/2005_AMC_12B_Problems) and [2005 AMC 10B #11](https://artofproblemsolving.com/wiki/index.php/2005_AMC_10B_Problems).
## Problem 10
The first term of a sequence is 2005. Each succeeding term is the sum of the cubes of the digits of the previous term. What is the ${2005}^{\text{th}$} term of the sequence?


$$\mathrm{(A)} 29 \qquad \mathrm{(B)} 55 \qquad \mathrm{(C)} 85 \qquad \mathrm{(D)} 133 \qquad \mathrm{(E)} 250$$

## Solution
Performing this operation several times yields the results of 133 for the second term, 55 for the third term, and 250 for the fourth term. The sum of the cubes of the digits of 250 equal 133, a complete cycle. The cycle is, excluding the first term, the $2^{\text{nd}}$, $3^{\text{rd}}$, and $4^{\text{th}}$ terms will equal 133, 55, and 250, following the fourth term. Any term number that is equivalent to 1\ ($\text{mod}$\ 3) will produce a result of 250. It just so happens that $2005\equiv $1\ ($\text{mod}$\ 3), which leads us to the answer of $\boxed{\textbf{(E) } 250}.$
## See also
