# 2018 AMC 12A Problem 4

> This problem is the same as [2018 AMC 10A #5](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_5) and [2018 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_4).
## Problem
Alice, Bob, and Charlie were on a hike and were wondering how far away the nearest town was. When Alice said, "We are at least $6$ miles away," Bob replied, "We are at most $5$ miles away." Charlie then remarked, "Actually the nearest town is at most $4$ miles away." It turned out that none of the three statements were true. Let $d$ be the distance in miles to the nearest town. Which of the following intervals is the set of all possible values of $d$?

$\textbf{(A) }   (0,4)   \qquad        \textbf{(B) }   (4,5)   \qquad    \textbf{(C) }   (4,6)   \qquad   \textbf{(D) }  (5,6)  \qquad  \textbf{(E) }   (5,\infty)$
## Solution 1
For each of the false statements, we identify its corresponding true statement. Note that:
<ol style="margin-left: 1.5em;">
  <li>$\mathrm{False}\cap\mathrm{True}=\varnothing.$</li><p>
  <li>$\mathrm{False}\cup\mathrm{True}=[0,\infty).$</li><p>
</ol>
We construct the following table:


$$\begin{array}{c||c|c}
& &  \\ [-2.5ex]
$\textbf{Hiker}$ & $\textbf{False Statement}$ & $\textbf{True Statement}$ \\ [0.5ex]
$$\hline$$
& & \\ [-2ex]
$\textbf{Alice} & [6,\infty) & [0,6) \\$
& & \\ [-2.25ex]
$\textbf{Bob} & [0,5] & (5,\infty)  \\$
& & \\ [-2.25ex]
$\textbf{Charlie} & [0,4] & (4,\infty)$
$\end{array}$$$


Taking the intersection of the true statements, we have

$$[0,6)\cap(5,\infty)\cap(4,\infty)=(5,6)\cap(4,\infty)=\boxed{\textbf{(D) } (5,6)}.$$


*~MRENTHUSIASM*
## Solution 2
Think of the distances as if they are on a number line. Alice claims that $d > 6$, Bob says $d < 5$, while Charlie thinks $d < 4$. This means that all possible numbers less than $5$ and greater than $6$ are included. However, since the three statements are actually false, the distance to the nearest town is one of the numbers not covered. Therefore, the answer is $\boxed{\textbf{(D) } (5,6)}$.
## Video Solution (HOW TO THINK CREATIVELY!)
https://youtu.be/nNEXCxWLJzc

Education, the Study of Everything
## Video Solution
https://youtu.be/vO-ELYmgRI8

*~IceMatrix*
## Video Solution
https://youtu.be/cLJ87xJzcWI

*~savannahsolver*
## See Also
