# 2006 AMC 12A Problem 12

> This problem is the same as [2006 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2006_AMC_12A_Problems) and [2006 AMC 10A #14](https://artofproblemsolving.com/wiki/index.php/2006_AMC_10A_Problems/Problem_14).
## Problem
A number of linked rings, each 1 cm thick, are hanging on a peg. The top ring has an outside diameter of 20 cm. The outside diameter of each of the outer rings is 1 cm less than that of the ring above it. The bottom ring has an outside diameter of 3 cm. What is the distance, in cm, from the top of the top ring to the bottom of the bottom ring?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(7cm); pathpen = linewidth(0.7); D(CR((0,0),10)); D(CR((0,0),9.5)); D(CR((0,-18.5),9.5)); D(CR((0,-18.5),9)); MP("$\vdots$",(0,-31),(0,0)); D(CR((0,-39),3)); D(CR((0,-39),2.5)); D(CR((0,-43.5),2.5)); D(CR((0,-43.5),2)); D(CR((0,-47),2)); D(CR((0,-47),1.5)); D(CR((0,-49.5),1.5)); D(CR((0,-49.5),1.0)); D((12,-10)--(12,10)); MP('20',(12,0),E); D((12,-51)--(12,-48)); MP('3',(12,-49.5),E);
```


$\textbf{(A) } 171\qquad\textbf{(B) } 173\qquad\textbf{(C) } 182\qquad\textbf{(D) } 188\qquad\textbf{(E) } 210\qquad$
## Solution 1
The inside diameters of the rings are the positive integers from 1 to 18.  The total distance needed is the sum of these values plus 2 for the top of the first ring and the bottom of the last ring. Using the formula for the sum of an [arithmetic series](https://artofproblemsolving.com/wiki/index.php/arithmetic_series), the answer is $\frac{18 \cdot 19}{2} + 2 = \boxed{\textbf{(B) }173}.$
## Solution 2
Alternatively, the sum of the consecutive integers from 3 to 20 is  $\frac{1}{2}(18)(3+20) = 207$ .  However, the 17 [intersection](https://artofproblemsolving.com/wiki/index.php/intersection)s between the rings must be subtracted, and we also get  207 - $2(17)=\boxed{\textbf{(B) }173}.$
## Solution 3 (Brute force)
We can just add all the numbers up. But, we have to account for the intersections, so the final expression is $3+\sum_{k=2}^{18}$ k, which is $\boxed{\textbf{(B) }173}.$ ~[shunyipanda](https://artofproblemsolving.com/wiki/index.php/shunyipanda)
## See Also
