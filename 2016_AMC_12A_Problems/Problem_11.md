# 2016 AMC 12A Problem 11

## Problem
Each of the 100 students in a certain summer camp can either sing, dance, or act. Some students have more than one talent, but no student has all three talents. There are 42 students who cannot sing, 65 students who cannot dance, and 29 students who cannot act. How many students have two of these talents?

$\textbf{(A)}\ 16\qquad\textbf{(B)}\ 25\qquad\textbf{(C)}\ 36\qquad\textbf{(D)}\ 49\qquad\textbf{(E)}\ 64$
## Solution
Let a be the number of students that can only sing, b can only dance, and c can only act.

Let ab be the number of students that can sing and dance, ac can sing and act, and bc can dance and act.

From the information given in the problem, a + ab + $b = $29, b + bc + $c = 42$, and a + ac + $c = 65$.

Adding these equations together, we get $2(a + b + c)$ + ab + bc + ac = 136.

Since there are a total of 100 students, a + b + c + ab + bc + ac = 100.

Subtracting these equations, we get a + b + $c = 36$.

Our answer is ab + bc + ac = 100 - (a + b + c) = 100 - $36 =\boxed{\textbf{(E)}\; 64}$
## Solution 2
An easier way to solve the problem:
Since 42 students cannot sing, there are $100-42=58$ students who can.

Similarly 65 students cannot dance, there are $100-65=35$ students who can.

And 29 students cannot act, there are $100-29=71$ students who can.

Therefore, there are $58+35+71=164$ students in all ignoring the overlaps between 2 of 3 talent categories.
There are no students who have all 3 talents, nor those who have none (0), so only 1 or 2 talents are viable.

Thus, there are $164-100=\boxed{\textbf{(E) }64}$ students who have 2 of 3 talents.
## Solution 3
First, we find the number of students that do not have 2 of the 3 talents.

Ignoring overlap, this will be $42+65+29=136$ students.

Accounting for overlap, there will be $136-100=36$ students that do not have 2 of the 3 talents.

Note that this is also equal to the number of students that only have 1 of the 3 talents

Therefore, the number of students who have 2 of the 3 talents is $100-36=\boxed{\textbf{(E) }64}$

*~SpectralScholar*
## See Also
