import CourseGradePenalty
require 'csv'

module DegreePlanGradePenaltyCalc
  # Collects processed course penalities to be reused in future degree plans, saving time on calculations
  @@course_digest_penalties = {}

  #
  # Takes one degree plan and appends the GPAO penalty data for each course
  # then takes the average GPAO penalty for the entire degree plan
  # Example call:
  # DegreePlanGradePenaltyCalc.run(path="degree_plan_LCSI - Computer Science (BS)_No Concentration.csv")
  def self.run(path)
    if not path
      return
    end

    puts "==================================================="
    puts "Calculating for #{path}"
    puts "==================================================="

    # Load the prep data into a map
    src_folder = "app/queries/gpao/degree_plans_from_median_term_taken"
    degree_plan_headers = ["Course ID","Course Name","Prefix","Number","Prerequisites","Corequisites","Strict-Corequisites","Credit Hours","Institution","Canonical Name","Term"]
    src_path = "#{src_folder}/#{path}"
    read_degree_plan = CSV.read(src_path, :headers => degree_plan_headers)
    append_data = []  # used to write new data to csv

    read_degree_plan[7..-1].each_with_index do |row, index|
      c_subj = row["Prefix"]
      c_crse = row["Number"]


      # Check if course digest pen has been recorded already 
      # in class variable -- save repeated work
      key = c_subj + " " + c_crse

      if @@course_digest_penalties.has_key?(key)
        append_data << @@course_digest_penalties[key]
        next
      end

      # Will hold the course data that 
      # will be appended to a new csv, 
      # and inserted in @@course_digest_penalties
      cd_range_data = {
        :cumulative => nil, :singular => nil, :grades => [],
        :cumulative_avg => nil, :singular_avg => nil,
        :total_students => nil, :most_recent_term => nil, :earliest_term => nil
      }

      # The most recent term recorded in GPAOther table
      # -- GPAOther table may not have old term courses
      upper_bound = GpaOther.where(:subj => c_subj, :crse => c_crse).maximum(:term)
      oldest_term = Course.where(:subj => c_subj, :crse => c_crse, :reg_status_code => "RE").minimum(:term)

      # If it is P/NP or very old course, there will be no GPAOther entry
      # Try to fill data w/ query from Course table
      unless upper_bound.present?
        puts "GPAOTHER entry not found #{c_subj} #{c_crse}"
        most_recent_term = Course.where(:subj => c_subj, :crse => c_crse, :reg_status_code => "RE").maximum(:term)

        # TODO: check if we need this 
        this_oldest_term = Course.where(:subj => c_subj, :crse => c_crse, :reg_status_code => "RE").minimum(:term)

        grades = []
        student_count = 0
        # course is not found in Course table
        # e.g. GEL 110B
        if most_recent_term.present?
          this_cd_range = Course
            .where(:subj => c_subj, :crse => c_crse, :reg_status_code => "RE")
            .where("term <= ?", most_recent_term)
            .where("term >= ?", most_recent_term - 100)
          student_count = this_cd_range.count
          grades = this_cd_range.distinct.pluck(:grade)
        end

        cd_range_data[:grades] = grades
        cd_range_data[:total_students] = student_count
        cd_range_data[:most_recent_term] = most_recent_term
        cd_range_data[:earliest_term] = this_oldest_term
      end

      upper_bound = upper_bound.to_int

      courseDigestRange = CourseDigest
        .where(:subj => c_subj, :crse => c_crse)
        .where("term <= ?", upper_bound)
        .where("term >= ?", upper_bound - 100)

      # iterate over a range of subj+crse spanning many terms
      courseDigestRange.each do |cd|
        # {:cumulative => [...], :singular => [...]}
        this_course_pen = CourseGradePenalty.calculate_ratings(cd)

        cd_range_data[:cumulative] << this_course_pen[:cumulative]
        cd_range_data[:singular] << this_course_pen[:singular]
        cd_range_data[:grades] <<  Course
        .where(:subj => cd.subj, :crse => cd.crse, :reg_status_code => "RE")
        .where("term <= ?", upper_bound)
        .where("term >= ?", upper_bound - 100)
        .distinct.pluck(:grade)

      end
      # flatten nested list data
      cd_range_data[:cumulative] = cd_range_data[:cumulative].flatten
      cd_range_data[:singular] = cd_range_data[:singular].flatten

      cd_range_data[:total_students] = cd_range_data[:singular].size
      cd_range_data[:grades] = cd_range_data[:grades].last
      cd_range_data[:most_recent_term] = upper_bound
      cd_range_data[:earliest_term] = oldest_term

      # average of cumulative and singular penatlies if there is data
      unless cd_range_data[:cumulative].nil? 
        cd_range_data[:cumulative_avg] = cd_range_data[:cumulative].sum() / cd_range_data[:cumulative].size
      end

      unless cd_range_data[:singular].nil? 
        cd_range_data[:singular_avg] = cd_range_data[:singular].sum() / cd_range_data[:singular].size
      end

      # record course digest penalty for repeated use
      @@course_digest_penalties[key] = cd_range_data

      # will write out separately when done reading in this loop
      append_data << cd_range_data

    end

    # use append_data
    # Write out new Degree Plan
    # then append on each row the cumulative and singular penalties
    destination_folder = "app/queries/gpao/degree_plans_with_grade_penalty"
    path = path[0...-4]  # remove initial csv extension from name
    destination_path = "#{destination_folder}/#{path}_with_grade_penalty.csv"
    # degree_plan_headers = ["Course ID","Course Name","Prefix","Number","Prerequisites","Corequisites","Strict-Corequisites","Credit Hours","Institution","Canonical Name","Term"]
    append_headers = ["Average Cumulative GPAO Penalty", "Average Singular GPAO Penalty", "Total Students", "Most Recent Term", "Earliest Term Offered", "Grades"]

    # A degree plan has the headers start on row 7
    # The loop counts the rows as j
    # If in the first 6 rows, keep the same
    # If on the 7th row, append headers with cumulative penalty, singular...
    # Otherwise append row with append_data, offset by 7
    CSV.open(destination_path, "w", :write_headers => false, :headers => degree_plan_headers + append_headers) do |csv|
      j = 0
      CSV.foreach(src_path) do |orig|
        if j < 6
          csv << orig
        elsif j == 6
          csv << orig + append_headers
        else
          csv << orig + [append_data[j-7][:cumulative_avg], append_data[j-7][:singular_avg], append_data[j-7][:total_students], append_data[j-7][:most_recent_term], append_data[j-7][:earliest_term], append_data[j-7][:grades]]
        end
        j = j + 1
      end
      
      # The last row computes average singular/cumulative penalty
      avg_cumulative_penalty = 0.0
      avg_singular_penalty = 0.0
      append_data.each do |course|
        if course[:cumulative_avg] == nil
          next
        end
        avg_cumulative_penalty += course[:cumulative_avg].to_f
        avg_singular_penalty += course[:singular_avg].to_f
      end
      avg_cumulative_penalty /= append_data.length
      avg_singular_penalty /= append_data.length

      lastRow = ["Overall Average"] # horizontal header
      (degree_plan_headers.length - 1).times { lastRow << "" } # blank spaces to align with headers
      lastRow << avg_cumulative_penalty
      lastRow << avg_singular_penalty

      csv << lastRow

    end
    
  end

  #
  # Driver function - from a source folder, calculate penalties for courses in each
  # degree plan
  #
  def self.batch_run(src = "app/queries/gpao/degree_plans_from_median_term_taken")
    # calc penalty on all entries except . and ..
    (Dir.entries(src) - [".", ".."]).each do |f|
      if f[0] == "."
        next
      end
      self.run(f)
    end
  end
  
  # NOT USED ANYMORE!!
  #
  # Prepares the average GPAO penalty data,
  # by subject and course, combining sections 
  # def self.prep_grade_penalty_data
  #   maxTerm = CourseDigest.maximum(:term)
  #   # 202203 to 200310
  #   diff = 1893

  #   courseDigests = CourseDigest.where("term <= ?", maxTerm).where("term >= ?", maxTerm - diff)
  #   data = {}
  #   # count = 0
  #   courseDigests.each do |cd|
  #     key = cd.subj + " " + cd.crse
  #     unless data.has_key?(key)
  #       data[key] = {:cumulative => [], :singular => [], :grades => []}
  #     end
  #     # {:cumulative => [...], :singular => [...]}
  #     this_course_pen = CourseGradePenalty.calculate_ratings(cd)

  #     data[key][:cumulative] << this_course_pen[:cumulative]
  #     data[key][:singular] << this_course_pen[:singular]
  #     data[key][:grades] <<  Course.where(:subj => cd.subj, :crse => cd.crse, :reg_status_code => "RE").where("term <= ?", maxTerm).where("term >= ?", maxTerm - 100).distinct.pluck(:grade)
  #     # count = count + 1
  #     # if count > 20
  #     #   break
  #     # end
  #   end

  #   combinedData = {}

  #   # puts data

  #   data.each do |key, values|
  #     # puts key
  #     # puts values
  #     combinedData[key] = {:cumulative => nil, :singular => nil, :grades => nil}
  #     if values[:cumulative].nil? || values[:cumulative].flatten.empty?
  #       combinedData[key][:cumulative] = 0
  #     else
  #       combinedData[key][:cumulative] = values[:cumulative].flatten.sum() / values[:cumulative].flatten.size
  #     end

  #     if values[:singular].nil? || values[:singular].flatten.empty?
  #       combinedData[key][:singular] = 0
  #     else
  #       combinedData[key][:singular] = values[:singular].flatten.sum() / values[:singular].flatten.size
  #     end

  #     combinedData[key][:grades] = values[:grades].last
  #   end
  #   # data.each do |key, values|
  #   #   puts "key", key
  #   # end
  #   cumulativePenList = []
  #   singularPenList = []
  #   CSV.open("degree_grade_penalty_data.csv", "w",
  #     :write_headers => true,
  #     :headers => ["", "subj", "crse", "avg_cumulative_GPAO_penalty", "avg_singular_GPAO_penalty", "grades"]
  #   ) do |csv|
  #     combinedData.each do |key, values|
  #       # avgCumulativePen = values[:cumulative].sum(0.0) / values[:cumulative].size
  #       # avgSingularPen = values[:singular].sum(0.0) / values[:singular].size
  #       subj, crse = key.split
  #       cumulativePenList.push(values[:cumulative])
  #       singularPenList.push(values[:singular])
  #       csv << ["", subj, crse,  values[:cumulative], values[:singular], values[:grades].join(" ")]
  #     end
  #   end

  # end

end